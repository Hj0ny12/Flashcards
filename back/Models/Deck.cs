namespace Flashcards.Api.Models;

public class Deck
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public ICollection<Card> Cards { get; set; } = new List<Card>();
}
