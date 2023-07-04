"use client"

import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import "../styles/game.css"
import { useEffect, useState } from "react";
import { redirect } from 'next/navigation';
import { setActualPlayer } from "@/redux/slices/actualPlayerSlice";
import { BoardCell, GameStage, Player, Riddle } from "../types";
import { HiOutlineShoppingCart } from "react-icons/hi"
import { TiTick } from "react-icons/ti";
import { ImCross } from "react-icons/im";
import { modifyPlayer } from "@/redux/slices/playerSlice";
import { modifySelf, setSelf } from "@/redux/slices/selfSlice";
import { setCurrentRiddle, setGameTable, setStage } from "@/redux/slices/gameSlice";
import Wheel from "../components/wheel";
import Desk from "../components/desk";
import Screen from "../components/screen";

export default function Game() {
    const players = useAppSelector(state => state.players);
    const actualPlayer = useAppSelector(state => state.actualPlayer);
    const dispatch = useAppDispatch();
    const [isSolving, setIsSolving] = useState(false);
    const [spinnedPrize, setSpinnedPrize] = useState<string | number>(0)
    const [screenShown, setScreenShown] = useState(false);

    useEffect(() => {
        dispatch(setActualPlayer(players[0]))
        if (players.length === 0) {
            redirect("/");
        }
    }, [])

    useEffect(() => {
        if (isSolving === true) {
            const div = (document.querySelectorAll(".solveLetter")[0] as HTMLElement)
            if (div) div.focus();
        }
    }, [isSolving])


    

    return (
        <div className="gamePage">
            {/* KELL A JÁTÉK INDÍTÁSAKOR */}
            {/* <div id="fadeOutDiv" className="fadeOutDark"></div> */}
            <div className="solveFade" id="solveFade" style={{ opacity: isSolving ? "0.9" : "0" }} />
            <Desk    spinnedPrize={spinnedPrize} screenShown={screenShown} />
            <Screen  spinnedPrize={spinnedPrize} />
            <Wheel   setScreenShown={setScreenShown} setSpinnedPrize={setSpinnedPrize} />
        </div >
    )
}