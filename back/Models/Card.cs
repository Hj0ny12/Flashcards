namespace Flashcards.Api.Models;

public class Card
{
    public int Id { get; set; }
    public int DeckId { get; set; }
    public string TargetWord { get; set; } = string.Empty;
    public string? Sentence { get; set; }
    public string? Translation { get; set; }
    public string? Definitions { get; set; }
    public Deck? Deck { get; set; }
}
