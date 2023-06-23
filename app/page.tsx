"use client";

import Image from 'next/image'
import logo from "../public/logo.png"
import background from "../public/wall.png"
import start from "../public/start.png"
import { useEffect, useRef, useState } from 'react'
import { BiEdit } from "react-icons/bi"
import { TiTick } from "react-icons/ti"
import { AiOutlineCopy } from "react-icons/ai"
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { addPlayer, modifyPlayer, reset } from '@/redux/slices/playerSlice';
import { Player } from './types';
import { addMessage } from '@/redux/slices/messageSlice';
import { setSelf } from '@/redux/slices/selfSlice';
import "./styles/home.css"
import { redirect } from 'next/navigation';

export default function Home() {
  const router = useRouter()

  const dispatch = useAppDispatch();
  const players = useAppSelector(state => state.players);
  const self = useAppSelector(state => state.self);
  const messages = useAppSelector(state => state.messages);
  const [init, setInit] = useState(false);
  const [isEditing, setEditing] = useState(false);
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const chatRef = useRef(null);

  useEffect(() => {
    window.addEventListener("mousemove", (e) => {
      const parallaxes = document.querySelectorAll(".parallax");
      if (!init) {
        document.querySelectorAll(".initPos").forEach((el) => {
          el.classList.remove("initPos")
        })
        setInit(true);
      }

      const xValue = e.clientX - window.innerWidth / 2;
      const yValue = e.clientY - window.innerHeight / 2;

      const rotateDegreeX = (xValue / (window.innerWidth / 2)) * 20;
      const rotateDegreeY = (yValue / (window.innerHeight / 2)) * 20;

      parallaxes.forEach(el => {
        if (el instanceof HTMLElement) {
          let speedX = el.dataset.speedx as unknown as number;
          let speedY = el.dataset.speedy as unknown as number;
          let speedR = el.dataset.rotation as unknown as number;
          el.style.transform = `rotateY(${rotateDegreeX * speedR}deg) rotateX(${-rotateDegreeY * speedR}deg) translateX(calc(-50% + ${xValue * speedX}px)) translateY(calc(-50% + ${yValue * speedY}px))`
        }
      })
    })
  }, [])

  const openRoom = () => {
    (document.getElementById("mainPage") as HTMLElement).style.transform = "translate(0,-100%)";
  }

  useEffect(() => {
    // PROBLÉMA: 3.-ként A belép, kap: id: 2, player id 0 kilép, belép B 3.-ként kap: id: 2
    dispatch(reset());
    const selfData = { name: `JÁTÉKOS${players.length + 1}`, id: players.length }
    dispatch(setSelf(selfData))
    dispatch(addPlayer(selfData))
    dispatch(addPlayer({ name: "Zsofi" }))
  }, [])

  const handleInputChange = (event: any) => {
    const modifiedData = { id: self.id, name: event.target.value } as Player
    dispatch(setSelf(modifiedData));
    dispatch(modifyPlayer(modifiedData))
    updateInputWidth();
  };

  const handleKeyDown = (event: any) => {
    if (event.keyCode === 13) {
      saveName();
    }
  }

  const saveName = () => {
    if (inputRef.current !== null) {
      inputRef.current.blur();
      setEditing(false);
    }
  }

  const updateInputWidth = () => {
    if (inputRef.current !== null) {
      inputRef.current.style.width = "0";
      inputRef.current.style.width = inputRef.current.scrollWidth + 'px';
    }
  };


  const handleSendMessage = () => {
    if (text !== "") {
      dispatch(addMessage({ sender: self, message: text }))
      setText("");
    }
  }

  useEffect(() => {
    const chat = document.getElementById("chat") as HTMLElement
    chat.scrollTop = chat.scrollHeight;
  }, [messages])

  const handleStartGame = () => {
    const opacityDiv = document.getElementById("opacityDiv") as HTMLElement;
    opacityDiv.classList.add("animateDiv");
    setTimeout(()=>{
      router.push("./game");
    },2000)
  }

  return (
    <main>
      <div id='opacityDiv' className='opacityDiv'></div>
      <div id='mainPage' className='mainPage'>
        <Image src={background} className='initPos background parallax' data-speedx="0.02" data-speedy="0.04" data-rotation="0" alt='background' priority unoptimized />
        <div className='parallax mainDiv initPos' data-speedx="0.07" data-speedy="0.07" data-rotation="0.7">
          <Image src={logo} className='logo' alt='szerencsekerék logo' />
          <Image src={start} className='start' data-speedx="0.07" data-speedy="0.07" data-rotation="0.7" alt='szerencsekerék start' onClick={openRoom} />
        </div>
      </div>
      <div className='roomPage'>
        <div className='outerBorder'>
          <div className='innerBorder'>
            <div className='lines'></div>
            <div className='innerDiv'>
              <div className='title'>CSATLAKOZOTT JÁTÉKOSOK</div>
              <div className='joinedPlayers'>
                {players.map((player) => (
                  <div key={player.id} className='player'>
                    {player.id === self.id ?
                      <>
                        <input type='text' ref={inputRef} className='selfInput' onBlur={() => { setEditing(false); }} value={self.name || ""} size={4} readOnly={isEditing ? false : true}
                          onChange={handleInputChange}
                          onKeyDown={handleKeyDown}
                        />(ÉN)<div className='modify' onClick={() => {
                          if (!isEditing) {
                            setEditing(true);
                            if (inputRef.current !== null) {
                              inputRef.current.focus();
                              inputRef.current.select();
                            }
                          } else {
                            saveName();
                          }
                        }}
                        >{isEditing ? <TiTick /> : <BiEdit />}</div>
                      </>
                      :
                      player.name
                    }
                  </div>
                ))}
              </div>
              <div className='roomCode'>SZOBAKÓD: <input className='code' onClick={(e: any) => { e.target.select(); navigator.clipboard.writeText(e.target.value); const copied: any = document.getElementById("copied"); copied.animate([{ opacity: 0 }, { opacity: 1 }, { opacity: 0 }], 1000) }} readOnly value={"41KJJHE2134IBU"}></input><div id='copied' className='copied' style={{ display: "flex", color: "green" }}><AiOutlineCopy /><TiTick /></div></div>
              <div className='buttons'>
                <div className='leftPanel'>
                  <div className='controlButton' onClick={()=>handleStartGame()}>JÁTÉK INDÍTÁSA</div>
                  <div className='controlButton'>CSATLAKOZÁS MÁSHOVA</div>
                </div>
                <div className='rightPanel'>
                  <div className='chat' id='chat'>
                    {messages.map((message, index) => {
                      return <div className='message' key={index} style={{ alignSelf: message.sender.id == self.id ? "flex-end" : "flex-start" }}>
                        <span style={{ fontWeight: "bolder", color: "#65afa4" }}>{message.sender.name}:</span> {message.message}
                      </div>
                    })}
                  </div>
                  <div className='chatInput'>
                    <input ref={chatRef} id='message' placeholder='CSEVEGÉS' value={text} onChange={(e) => { setText(e.target.value) }} onKeyDown={(e) => { if (e.keyCode == 13) handleSendMessage() }} />
                    <div className='sendButton' onClick={() => handleSendMessage()}>KÜLDÉS</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main >
  )
}