namespace Blog.Api.DTOs;

public record PostDto(
    Guid Id,
    string Title,
    string Content,
    DateTime CreatedAtUtc,
    string AuthorId,
    string AuthorEmail
);

public record CreatePostRequest(string Title, string Content);
public record UpdatePostRequest(string Title, string Content);
