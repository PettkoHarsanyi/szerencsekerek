import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { useEffect, useState } from "react"

export default function RoundTable() {

    const game = useAppSelector(state=>state.game)
    const [out, setOut] = useState(true);

    useEffect(()=>{
        setOut(true);
        setTimeout(()=>{
            setOut(false);
        },4000)
    },[game.round])

    return (
        <div className="roundTable" style={{transform: out?"translate(0%,0%)":"translate(-150%,0)"}}>
            <div>{game.round}. kör</div>
        </div>
    )
}