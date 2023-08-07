import { useAppDispatch } from "@/redux/hooks"
import "../styles/freeGame.css"
import { setFreeGame } from "@/redux/slices/gameSlice";

export default function FreeGame() {
    const dispatch = useAppDispatch();
    return (
        <div className="freeGame">
            <div className="freeGameInnerDiv">
                <div className="fgTitle">INGYENES MAGÁNHANGZÓ JÁTÉK</div>
                <div className="fgText">Az ingyenes magánhangzó játék során a játékosnak teljesítenie kell egy játékot, amiért ingyen magánhangzót kap. Ezt egy másik megbízott játékos felügyeli, becsületből fogadja vagy utasítja el a játékos szereplését.</div>
                <div className="fgButtons">
                    <div className="fgButton fgBack"  onClick={()=>{dispatch(setFreeGame(false))}}>VISSZA</div>
                    <div className="fgButton fgPlay" >JÁTÉK</div>
                </div>
            </div>
        </div>
    )
}