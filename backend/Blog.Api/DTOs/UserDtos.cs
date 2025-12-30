namespace Blog.Api.DTOs;

public record UserDto(
    string Id,
    string Email,
    DateTime CreatedAtUtc,
    string[] Roles
);

public record CreateUserRequest(
    string Email,
    string Password,
    string Role
);

public record UpdateUserRequest(
    string Email,
    string Role,
    string? NewPassword
);
