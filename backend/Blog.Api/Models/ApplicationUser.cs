using Microsoft.AspNetCore.Identity;

namespace Blog.Api.Models;

public class ApplicationUser : IdentityUser
{
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
