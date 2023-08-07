import { useAppSelector } from "@/redux/hooks"
import "../styles/leaderboard.css"
export default function Leaderboard(){

    const endGame = useAppSelector(state=>state.endGame);
    const actualPlayer = useAppSelector(state=>state.actualPlayer);
    return (
        <div className="leaderboard" >
            <div className="endGameDivDiv">
                {endGame.won ? <div>🎉 NYERTÉL {actualPlayer.points} ÉS EMELLÉ {endGame.endGameValue} FORINTOT 🎉<br />GRATULÁLUNK!!!</div>
                :
                <div>😣 VESZTETTÉL {actualPlayer.points} ÉS {endGame.endGameValue} FORINTOT 😖</div>}
            </div>
        </div>
    )
}