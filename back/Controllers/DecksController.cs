using Flashcards.Api.Data;
using Flashcards.Api.Dtos;
using Flashcards.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Flashcards.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DecksController(FlashcardsDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<DeckListItemDto>>> GetAll(CancellationToken cancellationToken)
    {
        var decks = await db.Decks
            .AsNoTracking()
            .OrderBy(d => d.Name)
            .Select(d => new DeckListItemDto(d.Id, d.Name))
            .ToListAsync(cancellationToken);

        return Ok(decks);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<DeckDetailDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var deck = await db.Decks
            .AsNoTracking()
            .Where(d => d.Id == id)
            .Select(d => new DeckDetailDto(
                d.Id,
                d.Name,
                d.Cards
                    .OrderBy(c => c.Id)
                    .Select(c => new CardDto(
                        c.Id,
                        c.TargetWord,
                        c.Sentence,
                        c.Translation,
                        c.Definitions))
                    .ToList()))
            .FirstOrDefaultAsync(cancellationToken);

        if (deck is null)
        {
            return NotFound();
        }

        return Ok(deck);
    }

    [HttpGet("{id:int}/count")]
    public async Task<ActionResult<int>> GetCardCount(int id, CancellationToken cancellationToken)
    {
        var cardCount = await db.Decks
            .Where(d => d.Id == id)
            .Select(d => d.Cards.Count)
            .FirstOrDefaultAsync(cancellationToken);

        return Ok(cardCount);
    }

    [HttpPost]
    public async Task<ActionResult<DeckListItemDto>> Create(
        [FromBody] CreateDeckRequest request,
        CancellationToken cancellationToken)
    {
        var name = request.Name?.Trim();
        if (string.IsNullOrWhiteSpace(name))
        {
            return BadRequest(new { error = "Deck name is required." });
        }

        var deck = new Deck { Name = name };
        db.Decks.Add(deck);

        try
        {
            await db.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException)
        {
            return Conflict(new { error = $"A deck named '{name}' already exists." });
        }

        return CreatedAtAction(
            nameof(GetById),
            new { id = deck.Id },
            new DeckListItemDto(deck.Id, deck.Name));
    }

    [HttpPost("{deckId:int}/cards")]
    public async Task<ActionResult<CardDto>> CreateCard(
        int deckId,
        [FromBody] CreateCardRequest request,
        CancellationToken cancellationToken)
    {
        var targetWord = request.TargetWord?.Trim();
        if (string.IsNullOrWhiteSpace(targetWord))
        {
            return BadRequest(new { error = "Target word is required." });
        }

        var deckExists = await db.Decks.AnyAsync(d => d.Id == deckId, cancellationToken);
        if (!deckExists)
        {
            return NotFound(new { error = $"Deck {deckId} was not found." });
        }

        var card = new Card
        {
            DeckId = deckId,
            TargetWord = targetWord,
            Sentence = request.Sentence?.Trim(),
            Translation = request.Translation?.Trim(),
            Definitions = request.Definitions?.Trim(),
        };

        db.Cards.Add(card);
        await db.SaveChangesAsync(cancellationToken);

        var dto = new CardDto(
            card.Id,
            card.TargetWord,
            card.Sentence,
            card.Translation,
            card.Definitions);

        return CreatedAtAction(nameof(GetById), new { id = deckId }, dto);
    }
}
