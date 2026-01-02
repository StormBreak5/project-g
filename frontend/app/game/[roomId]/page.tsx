import GamePageClient from './GamePageClient';

export default async function GamePage({ params }: { params: Promise<{ roomId: string }> }) {
    const { roomId } = await params;

    return <GamePageClient roomId={roomId} />;
}