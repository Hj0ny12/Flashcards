using Flashcards.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Flashcards.Api.Data;

public class FlashcardsDbContext(DbContextOptions<FlashcardsDbContext> options) : DbContext(options)
{
    public DbSet<Deck> Decks => Set<Deck>();
    public DbSet<Card> Cards => Set<Card>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Deck>(entity =>
        {
            entity.ToTable("decks");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name).HasColumnName("name").IsRequired();
            entity.HasIndex(e => e.Name).IsUnique();
            entity.HasMany(e => e.Cards)
                .WithOne(c => c.Deck)
                .HasForeignKey(c => c.DeckId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Card>(entity =>
        {
            entity.ToTable("cards");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.DeckId).HasColumnName("deck_id");
            entity.Property(e => e.TargetWord).HasColumnName("target_word").IsRequired();
            entity.Property(e => e.Sentence).HasColumnName("sentence");
            entity.Property(e => e.Translation).HasColumnName("translation");
            entity.Property(e => e.Definitions).HasColumnName("definitions");
            entity.HasIndex(e => e.DeckId).HasDatabaseName("idx_cards_deck_id");
        });
    }
}
