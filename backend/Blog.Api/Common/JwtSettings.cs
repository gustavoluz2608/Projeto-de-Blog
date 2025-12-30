namespace Blog.Api.Common;

public class JwtSettings
{
    public string Issuer { get; set; } = "Blog";
    public string Audience { get; set; } = "Blog";
    public string SigningKey { get; set; } = "CHANGE_ME";
    public int ExpMinutes { get; set; } = 60;
}
