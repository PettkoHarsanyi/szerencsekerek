import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import "../styles/freeGame.css";
import { setFreeGame } from "@/redux/slices/gameSlice";
import { useEffect, useState } from "react";

export default function FreeGame({setVovelsShown} : any) {
  const dispatch = useAppDispatch();
  const game = useAppSelector((state) => state.game);

  const [freeGames] = useState([
    {
      title: "Tátogó",
      task: "A játékosnak fél perc alatt le kell olvasnia 3 szót a Játékmester szájáról",
      time: 30,
    },
    {
      title: "Éneklő",
      task: "A játékosnak folytatnia kell a Játékmester által kiválasztott zene szövegét",
      time: null,
    },
    {
      title: "Kő, papír, olló",
      task: "A játékosnak le kell győznie a Játékmestert kő, papír, olló játékban",
      time: null,
    },
    {
      title: "Izompacsírta",
      task: "A játékosnak le kell nyomnia 10 fekvőtámaszt",
      time: null,
    },
    {
      title: "Shazam",
      task: "A játékosnak fel kell ismernie a Játékmester által lejátszott/énekelt zenét",
      time: null,
    },
    {
      title: "Kategóriák",
      task: "A Játékmester mond egy kategóriát (pl: autók), a játékosnak azon belül fel kell sorolnia 5 fajtát fél perc alatt",
      time: 30,
    },
  ]);

  const [gameStarted, setGameStarted] = useState(false);
  const [currentGame, setCurrentGame] = useState(freeGames[0]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [counting,setCounting] = useState(false);

  useEffect(() => {
    getRandomGame();
  }, [gameStarted]);

  const getRandomGame = () => {
    const randomGame = freeGames[Math.floor(Math.random() * freeGames.length)];
    if (randomGame === currentGame) {
      getRandomGame();
    } else {
      setCurrentGame(randomGame);
      setTimeLeft(randomGame.time as number);
    }
  };

  useEffect(()=>{
    if(counting && timeLeft>0){
      setTimeout(()=>{
        if(counting && timeLeft>0){
          setTimeLeft(timeLeft-1);
        }
      },1000)
    }
    if(!counting){
      setTimeLeft(currentGame.time as number)
    }
  },[timeLeft,counting])

  useEffect(()=>{
    if(timeLeft===0){
      setCounting(false);
    }
  },[timeLeft])

  if (game.freeGame)
    return (
      <div className="freeGame" style={{ opacity: game.freeGame ? 1 : 0 }}>
        <div className="freeGameInnerDiv">
          <div className="fgTitle">INGYENES MAGÁNHANGZÓ JÁTÉK</div>
          {!gameStarted && (
            <>
              <div className="fgText">
                Az ingyenes magánhangzó játék során a játékosnak teljesítenie
                kell egy játékot, amiért ingyen magánhangzót kap. Ezt egy másik
                játékos felügyeli, ő a "Játékmester", aki becsületből fogadja
                vagy utasítja el a játékos szereplését.
              </div>
              <div className="fgButtons">
                <div
                  className="fgButton fgBack"
                  onClick={() => {
                    dispatch(setFreeGame(false));
                  }}
                >
                  MÉGSE
                </div>
                <div
                  className="fgButton fgPlay"
                  onClick={() => {
                    setGameStarted(true);
                  }}
                >
                  JÁTÉK
                </div>
              </div>
            </>
          )}
          {gameStarted && (
           <>
              <div className="fgGameName">{currentGame.title}</div>
              <div className="fgText">{currentGame.task}</div>
              <div className="fgButtons">
                <div
                  className="fgGameButton"
                  style={{ color: "red" }}
                  onClick={() => {
                    setGameStarted(false);
                    dispatch(setFreeGame(false));
                  }}
                >
                  X
                </div>
                {currentGame.time !== null && (
                  <div
                    className="fgGameButton"
                    style={{ color: "white" }}
                    onClick={() => {
                      setCounting(!counting);
                    }}
                  >
                    {counting ? timeLeft : "Idő indítása"}
                  </div>
                )}
                <div className="fgGameButton" style={{ color: "green" }} onClick={()=>{setVovelsShown(true);dispatch(setFreeGame(false))}}>
                  OK
                </div>
              </div>
              <div className="otherGame" onClick={getRandomGame}>
                MÁSIK JÁTÉK -{">"}
              </div>
            </>
          )}
        </div>
      </div>
    );
  else {
    return "";
  }
}
