import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { GameStage } from "../types"
import "../styles/pickLetters.css"
import { useState } from "react"
import { setLetters } from "@/redux/slices/endGameSlice"
import { setStage } from "@/redux/slices/gameSlice"

export default function PickLetters() {
    const game = useAppSelector(state => state.game)
    const [letterIndex, setLetterIndex] = useState(0)
    const endGame = useAppSelector(state => state.endGame)
    const dispatch = useAppDispatch();
    const [chooseFromConsonants, setChooseFromConsonants] = useState(["B", "C", "D", "F", "G", "H", "J", "M", "P", "S", "V", "Z"])
    const [chooseFromVovels, setChooseFromVovels] = useState(["A", "Á", "É", "I", "Í", "O", "Ó", "U", "Ú", "Ü", "Ű", "Ö", "Ő",])

    const addLetter = (letter: String) => {
        let newArray = [...endGame.pickedLetters];
        newArray[letterIndex + 6] = letter;
        setLetterIndex(() => letterIndex + 1);
        dispatch(setLetters(newArray));
    }

    return (
        <div className="pickLetters" style={{ transform: game.stage === GameStage.ENDGAME_PICKING ? "translate(-50%,0)" : "translate(-50%,-200%)" }}>
            <div className="titleDiv">Válassz {letterIndex < 3 ? (3 - letterIndex) : "1"} {letterIndex < 3 ? "mássalhangzót" : "magánhangzót"}</div>
            <div className="pickLettersDiv">
                {letterIndex < 3 ?
                    (chooseFromConsonants as []).map((letter,ind) => <div key={ind} onClick={() => {
                        addLetter(letter)
                        setChooseFromConsonants(chooseFromConsonants.filter((_letter)=>_letter!==letter))
                    }} className="pickLetter">{letter}</div>)
                    :
                    (chooseFromVovels as []).map((letter,ind) => <div key={ind} onClick={() => {
                        addLetter(letter);
                        setChooseFromVovels(chooseFromVovels.filter((_letter)=>_letter!==letter))
                        dispatch(setStage(GameStage.ENDGAME_SOLVING))
                    }} className="pickLetter">{letter}</div>)
                }
            </div>
        </div>
    )
}