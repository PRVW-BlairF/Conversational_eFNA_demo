from __future__ import annotations

from app.schemas.fna import TranscriptSegment


def guided_demo_segments() -> list[TranscriptSegment]:
    lines = [
        ("adviser", "Thanks for coming in, can we start with your family situation?"),
        ("client", "Sure, I am married and we have 2 children aged 7 and 10."),
        ("adviser", "Great, and your current employment and income details?"),
        ("client", "I am a salaried engineering manager earning about 180000 a year."),
        ("client", "We also have a mortgage and monthly household expenses around 6000."),
        ("client", "I already have hospitalisation and life cover but I cannot recall insurer names."),
        ("client", "Main goals are retirement in about 20 years and education funding for the children."),
        ("client", "For investing I am moderate risk and can accept some temporary drawdowns."),
    ]
    return [
        TranscriptSegment(id=f"seed-{i}", speaker=speaker, text=text, timestamp=float(i * 18))
        for i, (speaker, text) in enumerate(lines)
    ]
