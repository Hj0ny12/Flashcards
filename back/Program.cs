using Flashcards.Api.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

var dbPath = Path.GetFullPath(
    Path.Combine(builder.Environment.ContentRootPath, "..", "database", "flashcards.db"));

if (!File.Exists(dbPath))
{
    throw new FileNotFoundException(
        $"Database not found at {dbPath}. Run: python database/init_db.py --seed",
        dbPath);
}

var connectionString = $"Data Source={dbPath}";

builder.Services.AddDbContext<FlashcardsDbContext>(options =>
    options.UseSqlite(connectionString));

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins("http://localhost:4200")
            .AllowAnyHeader()
            .AllowAnyMethod());
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<FlashcardsDbContext>();
    await db.Database.OpenConnectionAsync();
    await db.Database.ExecuteSqlRawAsync("PRAGMA foreign_keys = ON;");
    await db.Database.CloseConnectionAsync();
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors();
app.UseHttpsRedirection();
app.MapControllers();

app.Run();
