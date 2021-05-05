import  {useRef, useEffect, useState, useCallback} from 'react'
import Grid from '../Grid/Grid'
import Robert from '../Robert/Robert'
import classes from './GridContainer.module.css'
import { locateX, locateY, processChecker, status, winnerStatus } from './utils/'
import {ErrorBoundary} from '../Error Boundary/ErrorBoundary'

export default () => {
    // Essential states
    const [nodesState, setNodesState] = useState(null)
    const [nodeData, setNodData] = useState(null)
    const [time, setTime] = useState(false)
    const [live, setLive] = useState(true)
    const [winnerDeterminer, setWinnerDeterminer] = useState(null)
    const [turn, setTurn] = useState(null)
    const [turnCounter, setTurnCounter] = useState(0)


    const containerRef = useRef()

    // Initiliaze nodes(grids)
    useEffect(() => {
        initNodes()
    }, [])

    // disable turn if winner is present
    useEffect(() => {
        if (winnerDeterminer) {
            setTurn(null)
        }
    }, [winnerDeterminer])

    // main part od Game, whhere integartion with user and Robert is made
    useEffect(() => {
        let timeoutId
        let checkGame
        if (live) {
            if (!time) {
                if (nodeData) {
                    let resX = locateX(nodeData, nodesState)
                    if (resX) {
                        setNodesState([...resX])
                        nodeData.node.target.innerHTML = status.x

                        checkGame = processChecker(resX, status.x)
                        if (checkGame) {
                            setWinnerDeterminer(checkGame)
                            setLive(false)
                            return
                        }

                        setTime(true)
                        setTurn(status.y)
                        setTurnCounter((prevCount) => prevCount +1)

                        timeoutId = setTimeout(() => {
                            let resY = locateY(resX)
                            if (resY) {
                                let [indexY, nodesCopy] = resY

                                nodesCopy[indexY].node.innerHTML = status.y

                                checkGame = processChecker([...nodesCopy], status.y)
                                if (checkGame) {
                                    setLive(false)
                                    setWinnerDeterminer(checkGame)
                                    setTurnCounter(0)
                                    setTurn(0)
                                    setTime(null)
                                    return
                                }

                                setNodesState([...nodesCopy])
                            } else {
                                console.log("Draw")
                                setLive(false)
                                setWinnerDeterminer(winnerStatus.draw)
                                setTime(null)
                                setTurn(null)
                                return
                            }
                            setTime(null)
                            setTurn(status.x)
                            setTurnCounter((prevCount) => prevCount +1)
                        }, turnCounter <= 2 ? 1000 : 800);
                    }
                } 
            }
        }
        // clearTimeOut when game is over(for Optimization)
        return () => {
            if (!live) {
                clearTimeout(timeoutId)
            }
            
        }
    }, [nodeData, time, live])

    // this function is trigerred when games starts or restarts
    const initNodes = useCallback(() => {
        let state = []
        for (let [index, el] of Object.entries(containerRef.current.children)) {
            el.innerHTML = ""
            state.push({
                node: el,
                status: status.unTouched,
            })

            el.addEventListener("click", (e) => {
                setNodData({
                    index: +index,
                    node: e
                })
            })
        }

        setNodesState(state)
        setNodData(null)
        setLive(true)
        setWinnerDeterminer(null)
        setTurn(null)
        setTurnCounter(0)
    }, [])

    return (
        // ErrorBoundary is added to prevent any potential errors
        <ErrorBoundary>
            <div>
                <div 
                    className = {classes.Container}
                    ref = {containerRef}>
                    {[...new Array(9)].map((el, index) => <Grid key = {index} />)}
                </div>
                <Robert 
                    winner = {winnerDeterminer}
                    stopGreeting = {true ? nodeData : false}
                    turn = {turn}
                    reTry = {initNodes}
                    />
            </div>
        </ErrorBoundary>
    )
}