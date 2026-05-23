namespace Flashcards.Api.Dtos;

public record DeckListItemDto(int Id, string Name);

public record CardDto(
    int Id,
    string TargetWord,
    string? Sentence,
    string? Translation,
    string? Definitions);

public record DeckDetailDto(int Id, string Name, IReadOnlyList<CardDto> Cards);

public record CreateDeckRequest(string Name);

public record CreateCardRequest(
    string TargetWord,
    string? Sentence,
    string? Translation,
    string? Definitions);
