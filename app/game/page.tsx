"use client"

import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import "../styles/game.css"
import { useEffect, useState } from "react";
import { redirect } from 'next/navigation';
import { setActualPlayer } from "@/redux/slices/actualPlayerSlice";
import Wheel from "../components/wheel";
import Desk from "../components/desk";
import Screen from "../components/screen";

export default function Game() {
    const players = useAppSelector(state => state.players);
    const self = useAppSelector(state=> state.self)
    const dispatch = useAppDispatch();
    const [spinnedPrize, setSpinnedPrize] = useState<string | number>(0)
    const [screenShown, setScreenShown] = useState(false);

    useEffect(() => {
        dispatch(setActualPlayer(players[0]))
        if (players.length === 0) {
            redirect("/");
        }
    }, [])

    return (
        <div className="gamePage">
            {/* KELL A JÁTÉK INDÍTÁSAKOR */}
            <div id="fadeOutDiv" className="fadeOutDark"></div>
            <div className="solveFade" id="solveFade" style={{ opacity: self.isSolving ? "0.9" : "0" }} />
            <Desk    spinnedPrize={spinnedPrize} screenShown={screenShown} />
            <Screen  spinnedPrize={spinnedPrize} />
            <Wheel   setScreenShown={setScreenShown} setSpinnedPrize={setSpinnedPrize} />
        </div >
    )
}