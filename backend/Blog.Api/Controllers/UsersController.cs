using Blog.Api.DTOs;
using Blog.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Blog.Api.Controllers;

[ApiController]
[Route("api/users")] 
[Authorize(Roles = "ADMIN")]
public class UsersController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;

    public UsersController(UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager)
    {
        _userManager = userManager;
        _roleManager = roleManager;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetAll()
    {
        var users = await _userManager.Users
            .AsNoTracking()
            .OrderByDescending(u => u.CreatedAtUtc)
            .ToListAsync();

        var dtos = new List<UserDto>();
        foreach (var u in users)
        {
            var roles = await _userManager.GetRolesAsync(u);
            dtos.Add(new UserDto(u.Id, u.Email ?? "", u.CreatedAtUtc, roles.ToArray()));
        }

        return Ok(dtos);
    }

    [HttpPost]
    public async Task<ActionResult<UserDto>> Create([FromBody] CreateUserRequest req)
    {
        var email = req.Email.Trim().ToLowerInvariant();
        var role = string.IsNullOrWhiteSpace(req.Role) ? "USER" : req.Role.Trim().ToUpperInvariant();

        if (role != "USER" && role != "ADMIN")
            return BadRequest(new { message = "Role inválida. Use USER ou ADMIN." });

        if (!await _roleManager.RoleExistsAsync(role))
            await _roleManager.CreateAsync(new IdentityRole(role));

        var existing = await _userManager.FindByEmailAsync(email);
        if (existing != null)
            return Conflict(new { message = "Já existe um usuário com este e-mail." });

        var user = new ApplicationUser { UserName = email, Email = email };
        var result = await _userManager.CreateAsync(user, req.Password);
        if (!result.Succeeded)
            return BadRequest(new { message = "Não foi possível criar o usuário.", errors = result.Errors.Select(e => e.Description) });

        await _userManager.AddToRoleAsync(user, role);

        var roles = await _userManager.GetRolesAsync(user);
        return Ok(new UserDto(user.Id, user.Email ?? "", user.CreatedAtUtc, roles.ToArray()));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update([FromRoute] string id, [FromBody] UpdateUserRequest req)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return NotFound();

        var email = req.Email.Trim().ToLowerInvariant();
        var role = string.IsNullOrWhiteSpace(req.Role) ? "USER" : req.Role.Trim().ToUpperInvariant();

        if (role != "USER" && role != "ADMIN")
            return BadRequest(new { message = "Role inválida. Use USER ou ADMIN." });

        // email
        user.Email = email;
        user.UserName = email;
        var upd = await _userManager.UpdateAsync(user);
        if (!upd.Succeeded)
            return BadRequest(new { message = "Não foi possível atualizar o usuário.", errors = upd.Errors.Select(e => e.Description) });

        // role (single-role model)
        var currentRoles = await _userManager.GetRolesAsync(user);
        var current = currentRoles.FirstOrDefault();
        if (current != role)
        {
            if (!string.IsNullOrWhiteSpace(current))
                await _userManager.RemoveFromRoleAsync(user, current);
            if (!await _roleManager.RoleExistsAsync(role))
                await _roleManager.CreateAsync(new IdentityRole(role));
            await _userManager.AddToRoleAsync(user, role);
        }

        // password reset (optional)
        if (!string.IsNullOrWhiteSpace(req.NewPassword))
        {
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var pw = await _userManager.ResetPasswordAsync(user, token, req.NewPassword);
            if (!pw.Succeeded)
                return BadRequest(new { message = "Não foi possível redefinir a senha.", errors = pw.Errors.Select(e => e.Description) });
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete([FromRoute] string id)
    {
        var meId = _userManager.GetUserId(User);
        if (meId == id)
            return BadRequest(new { message = "Você não pode excluir seu próprio usuário." });

        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return NotFound();

        var res = await _userManager.DeleteAsync(user);
        if (!res.Succeeded)
            return BadRequest(new { message = "Não foi possível excluir o usuário.", errors = res.Errors.Select(e => e.Description) });

        return NoContent();
    }
}
