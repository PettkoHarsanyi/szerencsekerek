import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useEffect, useState } from "react";
import { GameStage, Player } from "../types";
import { setGameTable, setStage } from "@/redux/slices/gameSlice";
import { setActualPlayer } from "@/redux/slices/actualPlayerSlice";
import { modifyPlayer, switchPlayersTotal } from "@/redux/slices/playerSlice";
import { modifySelf, setSolving } from "@/redux/slices/selfSlice";
import { HiOutlineShoppingCart } from "react-icons/hi";

export default function Desk({ spinnedPrize, screenShown }: any) {
    const CONSONANTS = ["b", "c", "d", "f", "g", "h", "j", "k", "l", "m", "n", "p", "r", "s", "t", "v", "y", "z"];
    const VOWELS = ["a", "á", "e", "é", "i", "í", "u", "ú", "ü", "ű", "o", "ó", "ö", "ő"];
    const VOVELPRICE = 100000;

    const players = useAppSelector(state => state.players);
    const actualPlayer = useAppSelector(state => state.actualPlayer);
    const self = useAppSelector(state => state.self)
    const game = useAppSelector(state => state.game)

    const [canGuess, setCanGuess] = useState(false);    // Tippelést engedi / tiltja
    const [vovelsShown, setVovelsShown] = useState(false);  // A magánhangzók mutatva vannak-e
    const [roundConsonants, setRoundConsonants] = useState(CONSONANTS); // Az aktuális kör mássalhangzói
    const [roundVowels, setRoundVowels] = useState(VOWELS); // Az aktuális kör magánhangzói
    const dispatch = useAppDispatch();

    useEffect(()=>{
        if(game.round===3){
            dispatch(switchPlayersTotal())
        }
    },[game.round])

    useEffect(() => {
        if (game.stage === GameStage.GUESSING) {
            setCanGuess(true);
        }
    }, [game.stage])

    useEffect(() => {
        setRoundConsonants(CONSONANTS);
        setRoundVowels(VOWELS);
    }, [game.round])

    // A kipörgetett érték hozzáadása a játékoshoz
    const addPrizeToPlayer = (prize: any, multiplier: number = 1) => {
        if (prize && !isNaN(prize)) {
            let toModify: Player = { ...actualPlayer, points: actualPlayer.points! + (prize * multiplier) }
            dispatch(setActualPlayer(toModify))
            dispatch(modifyPlayer(toModify))
            dispatch(modifySelf(toModify));
        }
    }


    // Egy betű megtippelése
    const guessLetter = (letter: string) => {
        setCanGuess(false);
        if (game.local || self.id === actualPlayer.id) {
            if (game.currentRiddle?.riddle.includes(letter)) {
                // Ha van benne olyan betű, amilyet tippeltek
                dispatch(setGameTable(game.gameTable.map((row: any) => row.map((cell: any) => {
                    if (cell.letter === letter) {
                        return { ...cell, known: true }
                    } else {
                        return cell;
                    }
                }))))

                let timeOfOccurance = game.currentRiddle?.riddle.split("").reduce((count: any, character: string) => {
                    if (character === letter) {
                        return count + 1;
                    }
                    return count;
                }, 0);


                addPrizeToPlayer(spinnedPrize, timeOfOccurance);
            } else {
                // Ha nincs
                const currentPlayerIndex = players.findIndex((player) => player.id === actualPlayer.id);
                dispatch(setActualPlayer(players[(currentPlayerIndex + 1) % players.length]))
                const borderDivs = document.querySelectorAll(".signal");
                borderDivs.forEach(div => {
                    if (div instanceof HTMLElement) {
                        div.animate([{ borderColor: "red" }, { borderColor: "#00eef0" }], 2000)
                    }
                })
            }
            setRoundConsonants(roundConsonants.filter(cns => cns !== letter));
            setRoundVowels(roundVowels.filter(cns => cns !== letter));
            setVovelsShown(false);
            setTimeout(() => {
                dispatch(setStage(GameStage.SPINNING))
            }, 1500)
        }
    }

    // Egy magánhangzó vétele
    const handleBuyVowel = () => {
        if (((!game.local && actualPlayer.points! >= 100000) || (actualPlayer.points! >= VOVELPRICE)) && !vovelsShown) {
            setVovelsShown(true)
            handleModifyPlayer(actualPlayer.id!, { points: actualPlayer.points! - VOVELPRICE })
        }
    }


    const handleModifyPlayer = (id: number, data: any) => {
        const player = { ...players.find(plyr => plyr.id === id), ...data }
        dispatch(setActualPlayer(player))
        dispatch(modifyPlayer(player))
        dispatch(modifySelf(player));
    }

    return (
        <div className="deskAndLetters" style={{ pointerEvents: canGuess ? "all" : "none" }} >
            <div className={`gameConsonants ${!game.local ? actualPlayer.id === self.id ? "" : "consonantsHidden" : ""} ${vovelsShown || self.isSolving || game.stage !== GameStage.GUESSING || !canGuess /* || game.stage===GameStage.PLACEMENT */ ? "consonantsHidden" : ""}`} >
                {roundConsonants.map((letter, index) => (
                    <div className="gameLetter" onClick={() => guessLetter(letter)} key={index}>{letter.toUpperCase()}</div>
                ))}
            </div>
            <div className={`gameVowels ${vovelsShown && !self.isSolving && game.stage === GameStage.GUESSING && canGuess ? "vovelsShown" : ""}`} >
                {roundVowels.map((letter, index) => (
                    <div className="gameLetter" onClick={() => guessLetter(letter)} key={index}>{letter.toUpperCase()}</div>
                ))}
            </div>
            <div className="gameDesk">
                <div className="gamePlayers">
                    {players.map(player => (
                        <div className={`gamePlayer ${actualPlayer.id === player.id ? "bg-[#ff00fc]" : "bg-[#191d4b]"}`} key={player.id}><div>{player.name.toUpperCase()}<br /><span>{game.stage === GameStage.PLACEMENT ? player.placementPoints : player.points}</span></div></div>
                    ))}
                    <div className="prizeScreen" style={{ opacity: screenShown ? 1 : 0 }}>
                        {spinnedPrize}
                    </div>
                </div>
                <div className="gameButtons" style={{ transform: game.stage === GameStage.GUESSING ? "translate(0%,0)":"translate(200%,0)" }}>
                    <div className="buyMenu">
                        <HiOutlineShoppingCart style={{ color: "#00eef0", fontSize: "4vh" }} />
                        <div id="buyVowelDiv" className="buyVowel" onClick={handleBuyVowel} onMouseOver={(event) => { event.currentTarget.style.backgroundColor = (!game.local && actualPlayer.points! >= VOVELPRICE) || (actualPlayer.points! >= VOVELPRICE) ? "green" : "#ff000068" }} onMouseLeave={(event) => { event.currentTarget.style.backgroundColor = "" }}>
                            <div>AÁ</div>
                            <div>100.000</div>
                        </div>
                    </div>
                    <div className="startSolve" onClick={() => { dispatch(setSolving(true)) }}>MEGFEJT</div>
                </div>
            </div>
        </div>
    )
}