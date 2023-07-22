import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import "../styles/swap.css";
import { swapPlayerPoints } from "@/redux/slices/playerSlice";
import { setActualPlayer } from "@/redux/slices/actualPlayerSlice";

export default function Swap({ isSwapping, setIsSwapping, setCanSpin }: any) {
    const players = useAppSelector(state => state.players);
    const actualPlayer = useAppSelector(state => state.actualPlayer);
    const dispatch = useAppDispatch();

    return (
        <div className="swapDiv" style={{ opacity: isSwapping ? 1 : 0, visibility: isSwapping ? "visible" : "hidden" }}>
            <div className="swapQuestion">KIVEL CSERÉLSZ?</div>
            <div className="swapPlayers">
                {players.map((player, index) => {
                    if (player.id === actualPlayer.id) {
                        return ""
                    } else {
                        return <div className="swapPlayer" key={index} onClick={() => {
                            setIsSwapping(false);
                            setCanSpin(true)
                            dispatch(swapPlayerPoints({"from":player,"to":actualPlayer}));
                            dispatch(setActualPlayer({...actualPlayer, points: player.points}))
                        }}>{player.name}<br /><span>{player.points}</span></div>
                    }
                })
                }
            </div>
        </div>
    )
}