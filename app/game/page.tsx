"use client"

import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import "../styles/game.css"
import { useEffect } from "react";
import { redirect } from 'next/navigation';
import { setActualPlayer } from "@/redux/slices/actualPlayerSlice";

export default function Game() {
    const players = useAppSelector(state=>state.players);
    const actualPlayer = useAppSelector(state=>state.actualPlayer);
    const dispatch = useAppDispatch();

    useEffect(()=>{
        if(players.length === 0){
            redirect("/");
        }
        dispatch(setActualPlayer(players[0]))
        const fadeOutDiv = document.getElementById("fadeOutDiv") as HTMLElement;
        fadeOutDiv.classList.add("fadedOut");
        setTimeout(()=>{
            fadeOutDiv.remove();
        },2000)
    },[])

    return (
        <div className="gamePage">
            <div id="fadeOutDiv" className="fadeOutDark"></div>
            <div className="gameDesk">
                <div className="gamePlayers">
                    {players.map(player=>(
                        <div className={`gamePlayer ${actualPlayer.id === player.id ? "bg-[#ff00fc]" : "bg-[#191d4b]"}`} key={player.id}><div>{player.name.toUpperCase()}<br /><span>{player.points}</span></div></div>
                    ))}
                </div>
            </div>
        </div>
    )
}