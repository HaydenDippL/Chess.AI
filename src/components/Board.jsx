import { useState, useEffect } from 'react'

import { invoke } from "@tauri-apps/api/tauri";

import wp from '../assets/pieces/wp.png'
import wr from '../assets/pieces/wr.png'
import wn from '../assets/pieces/wn.png'
import wb from '../assets/pieces/wb.png'
import wq from '../assets/pieces/wq.png'
import wk from '../assets/pieces/wk.png'
import bp from '../assets/pieces/bp.png'
import br from '../assets/pieces/br.png'
import bn from '../assets/pieces/bn.png'
import bb from '../assets/pieces/bb.png'
import bq from '../assets/pieces/bq.png'
import bk from '../assets/pieces/bk.png'

const size = 110
const white_board_color = '#EBECD0'
const black_board_color = '#739552'

function get_piece_png(piece) {
    switch(piece) {
        case 'P': return wp
        case 'R': return wr
        case 'N': return wn
        case 'B': return wb
        case 'Q': return wq
        case 'K': return wk

        case 'p': return bp
        case 'r': return br
        case 'n': return bn
        case 'b': return bb
        case 'q': return bq
        case 'k': return bk
    }
}

function Board(props) {
    let white = true
    const ranks = Array.from({ length: 8 }, (_, index) => 8 - index)
    const files = Array.from({ length: 8 }, (_, index) => String.fromCharCode('a'.charCodeAt(0) + index))
    if (!white) {
        ranks.reverse()
        files.reverse()
    }

    const [chess, set_chess] = useState({
        board: [
            /* 8 */ ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'], // black
            /* 7 */ ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'], // black
            /* 6 */ [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
            /* 5 */ [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
            /* 4 */ [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
            /* 3 */ [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
            /* 2 */ ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'], // white
            /* 1 */ ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'], // white
            /*        a    b    c    d    e    f    g    h */
        ],
        a8r_still: true,
        bk_still: true,
        h8r_still: true,
        a1r_still: true,
        wk_still: true,
        h1r_still: true,
        prev_move_double_pawn: ' ', // file of pawn
        bk: 'e8',
        wk: 'e1'
    })

    function rank_to_index(rank) { return 8 - rank }
    function file_to_index(file) { return file.charCodeAt(0) - 'a'.charCodeAt(0) }

    const [selected_piece, set_selected_piece] = useState(null)

    function square_click(file, rank) {
        if (!selected_piece) {
            // if user selects an empty square do nothing
            if (chess.board[rank_to_index(rank)][file_to_index(file)] === ' ') return

            // if user selects a square with a piece select it
            set_selected_piece({
                piece: chess.board[rank_to_index(rank)][file_to_index(file)],
                file: file,
                rank: rank
            })
        } else if (selected_piece.rank === rank && selected_piece.file === file) {
            // use unselects piece
            set_selected_piece(null)
        } else {
            // check valid move
            invoke('valid_move', chess)
                .then(board => console.log({
                    ...board,
                    from_rank: selected_piece.rank,
                    from_file: selected_piece.file,
                    to_rank: rank,
                    to_file: file
                }))

            set_chess(prev_state => {
                // move the piece
                prev_state.board[rank_to_index(selected_piece.rank)][file_to_index(selected_piece.file)] = ' '
                prev_state.board[rank_to_index(rank)][file_to_index(file)] = selected_piece.piece

                // change castling state
                if (selected_piece.piece === 'wk') {
                    prev_state.wk_still = false
                    prev_state.wk = `${file}${rank}`
                } else if (prev_state.a1r_still && selected_piece.piece === 'wr' && 
                    selected_piece.file === 'a' && selected_piece.rank === 1) {
                        prev_state.a1r_still = false
                } else if (prev_state.h1r_still && selected_piece.piece === 'wr' && 
                    selected_piece.file === 'h' && selected_piece.rank === 1) {
                        prev_state.h1r_still = false
                } else if (selected_piece.piece === 'bk') {
                    prev_state.bk_still = false
                    prev_state.bk = `${file}${rank}`
                } else if (prev_state.a8r_still && selected_piece.piece === 'br' && 
                    selected_piece.file === 'a' && selected_piece.rank === 8) {
                        prev_state.a8r_still = false
                } else if (prev_state.h8r_still && selected_piece.piece === 'br' && 
                    selected_piece.file === 'h' && selected_piece.rank === 8) {
                        prev_state.h8r_still = false
                }

                return prev_state
            })

            set_selected_piece(null)
        }
    }
    
    return <div id='board' style={{display: 'inline-flex', borderRadius: '5px', overflow: 'hidden'}}>
        <svg width={8 * size} height={8 * size}>
            {
                ranks.map((rank, r) => {
                    return files.map((file, c) => {
                        const piece_is_selected = selected_piece && selected_piece.rank === rank && selected_piece.file === file
                        const color = piece_is_selected ? yellow_tint(color_of_cell(file, rank)) : color_of_cell(file, rank)
                        return <rect
                            id={`${file}${rank}`}
                            key={`${file}${rank}`}
                            width={size}
                            height={size}
                            x={c * size}
                            y={r * size}
                            fill={color}
                            onClick={() => square_click(file, rank)}
                        />
                    })
                })
            }
            {
                files.map((file, r) => {
                    return <text
                        key={file}
                        x={(r + 0.8) * size}
                        y={7.9 * size}
                        fontWeight={600}
                        fontSize='24'
                        fill={r % 2 == 1 ? black_board_color : white_board_color}
                    >
                        {file}
                    </text>
                })
            }
            {
                ranks.map((rank, r) => {
                    return <text
                        key={rank}
                        x={size * 0.07}
                        y={r * size + size * 0.25}
                        fontWeight={600}
                        fontSize='24'
                        fill={r % 2 == 0 ? black_board_color : white_board_color}
                    >
                        {rank}
                    </text>
                })
            }
            {
                ranks.map((rank, r) => {
                    return files.map((file, c) => {
                        let piece = chess.board[rank_to_index(rank)][file_to_index(file)]
                        if (piece !== ' ')
                            return <image
                                key={`${file}${rank}`}
                                href={get_piece_png(piece)}
                                height={size}
                                width={size}
                                x={c * size}
                                y={r * size}
                                style={{pointerEvents: 'none', transition: 'transform 0.5s linear'}}
                            />
                    })
                })
            }
        </svg>
    </div>
}

function color_of_cell(file, rank) {
    return ((file.charCodeAt(0) - 'a'.charCodeAt(0)) + rank) % 2 == 1 ? black_board_color : white_board_color
}

function yellow_tint(color) {
    switch(color) {
        case '#EBECD0': return '#F5F682'
        case '#739552': return '#B9CA43'
    }
}

function red_tint(color) {
    switch(color) {
        case '#EBECD0': return '#EB7D6A'
        case '#739552': return '#D36C50'
    }
}

export default Board