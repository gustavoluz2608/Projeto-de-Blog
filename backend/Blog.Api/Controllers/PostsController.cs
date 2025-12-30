using Blog.Api.Data;
using Blog.Api.DTOs;
using Blog.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Blog.Api.Controllers;

[ApiController]
[Route("api/posts")] 
[Authorize]
public class PostsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly UserManager<ApplicationUser> _userManager;

    public PostsController(AppDbContext db, UserManager<ApplicationUser> userManager)
    {
        _db = db;
        _userManager = userManager;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PostDto>>> GetAll()
    {
        var posts = await _db.Posts
            .AsNoTracking()
            .Include(p => p.Author)
            .OrderByDescending(p => p.CreatedAtUtc)
            .Select(p => new PostDto(
                p.Id,
                p.Title,
                p.Content,
                p.CreatedAtUtc,
                p.AuthorId,
                p.Author != null ? (p.Author.Email ?? "") : ""
            ))
            .ToListAsync();

        return Ok(posts);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<PostDto>> GetById([FromRoute] Guid id)
    {
        var p = await _db.Posts.AsNoTracking().Include(x => x.Author).FirstOrDefaultAsync(x => x.Id == id);
        if (p == null) return NotFound();

        return Ok(new PostDto(p.Id, p.Title, p.Content, p.CreatedAtUtc, p.AuthorId, p.Author?.Email ?? ""));
    }

    [HttpPost]
    public async Task<ActionResult<PostDto>> Create([FromBody] CreatePostRequest req)
    {
        var userId = _userManager.GetUserId(User);
        if (userId == null) return Unauthorized();

        if (string.IsNullOrWhiteSpace(req.Title) || string.IsNullOrWhiteSpace(req.Content))
            return BadRequest(new { message = "Título e conteúdo são obrigatórios." });

        var post = new Post
        {
            Title = req.Title.Trim(),
            Content = req.Content.Trim(),
            AuthorId = userId,
            CreatedAtUtc = DateTime.UtcNow
        };

        _db.Posts.Add(post);
        await _db.SaveChangesAsync();

        var authorEmail = User.Identity?.Name ?? "";
        var dto = new PostDto(post.Id, post.Title, post.Content, post.CreatedAtUtc, post.AuthorId, authorEmail);

        return CreatedAtAction(nameof(GetById), new { id = post.Id }, dto);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update([FromRoute] Guid id, [FromBody] UpdatePostRequest req)
    {
        var userId = _userManager.GetUserId(User);
        if (userId == null) return Unauthorized();

        var post = await _db.Posts.FirstOrDefaultAsync(x => x.Id == id);
        if (post == null) return NotFound();

        if (post.AuthorId != userId)
            return Forbid();

        post.Title = req.Title.Trim();
        post.Content = req.Content.Trim();

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete([FromRoute] Guid id)
    {
        var userId = _userManager.GetUserId(User);
        if (userId == null) return Unauthorized();

        var post = await _db.Posts.FirstOrDefaultAsync(x => x.Id == id);
        if (post == null) return NotFound();

        if (post.AuthorId != userId)
            return Forbid();

        _db.Posts.Remove(post);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
