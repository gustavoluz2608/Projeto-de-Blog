using Blog.Api.DTOs;
using Blog.Api.Models;
using Blog.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Blog.Api.Controllers;

[ApiController]
[Route("api/auth")] 
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly IJwtTokenService _jwt;

    public AuthController(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        IJwtTokenService jwt)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _jwt = jwt;
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest req)
    {
        var email = req.Email.Trim().ToLowerInvariant();

        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(req.Password))
            return BadRequest(new { message = "Email e senha são obrigatórios." });

        var existing = await _userManager.FindByEmailAsync(email);
        if (existing != null)
            return Conflict(new { message = "Já existe um usuário com este e-mail." });

        var user = new ApplicationUser { UserName = email, Email = email };
        var result = await _userManager.CreateAsync(user, req.Password);

        if (!result.Succeeded)
            return BadRequest(new { message = "Não foi possível criar o usuário.", errors = result.Errors.Select(e => e.Description) });

        // papel padrão
        await _userManager.AddToRoleAsync(user, "USER");

        var roles = await _userManager.GetRolesAsync(user);
        var (token, exp) = _jwt.CreateToken(user, roles);

        return Ok(new AuthResponse(token, exp, new UserMe(user.Id, user.Email ?? "", roles.ToArray())));
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest req)
    {
        var email = req.Email.Trim().ToLowerInvariant();
        var user = await _userManager.FindByEmailAsync(email);

        if (user == null)
            return Unauthorized(new { message = "Credenciais inválidas." });

        var ok = await _signInManager.CheckPasswordSignInAsync(user, req.Password, lockoutOnFailure: false);
        if (!ok.Succeeded)
            return Unauthorized(new { message = "Credenciais inválidas." });

        var roles = await _userManager.GetRolesAsync(user);
        var (token, exp) = _jwt.CreateToken(user, roles);

        return Ok(new AuthResponse(token, exp, new UserMe(user.Id, user.Email ?? "", roles.ToArray())));
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<UserMe>> Me()
    {
        var userId = _userManager.GetUserId(User);
        if (userId == null)
            return Unauthorized();

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            return Unauthorized();

        var roles = await _userManager.GetRolesAsync(user);
        return Ok(new UserMe(user.Id, user.Email ?? "", roles.ToArray()));
    }

    // JWT é stateless. O "logout" é client-side (remover o token).
    [HttpPost("logout")]
    [Authorize]
    public IActionResult Logout() => Ok(new { message = "Logout efetuado. Remova o token no cliente." });
}
