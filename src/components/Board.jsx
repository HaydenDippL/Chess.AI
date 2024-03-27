import { useState, useEffect } from 'react'

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
        case 'wp': return wp
        case 'wr': return wr
        case 'wn': return wn
        case 'wb': return wb
        case 'wq': return wq
        case 'wk': return wk
        case 'bp': return bp
        case 'br': return br
        case 'bn': return bn
        case 'bb': return bb
        case 'bq': return bq
        case 'bk': return bk
    }
}

function Board(props) {
    let white = true
    const rows = Array.from({ length: 8 }, (_, index) => 8 - index)
    const cols = Array.from({ length: 8 }, (_, index) => String.fromCharCode('a'.charCodeAt(0) + index))
    if (!white) {
        rows.reverse()
        cols.reverse()
    }

    const [board, set_board] = useState({
        8: {a: 'br', b: 'bn', c: 'bb', d: 'bq', e: 'bk', f: 'bb', g: 'bn', h: 'br'},
        7: {a: 'bp', b: 'bp', c: 'bp', d: 'bp', e: 'bp', f: 'bp', g: 'bp', h: 'bp'},
        6: {a: ' ',  b: ' ',  c: ' ',  d: ' ',  e: ' ',  f: ' ',  g: ' ',  h: ' ' },
        5: {a: ' ',  b: ' ',  c: ' ',  d: ' ',  e: ' ',  f: ' ',  g: ' ',  h: ' ' },
        4: {a: ' ',  b: ' ',  c: ' ',  d: ' ',  e: ' ',  f: ' ',  g: ' ',  h: ' ' },
        3: {a: ' ',  b: ' ',  c: ' ',  d: ' ',  e: ' ',  f: ' ',  g: ' ',  h: ' ' },
        2: {a: 'wp', b: 'wp', c: 'wp', d: 'wp', e: 'wp', f: 'wp', g: 'wp', h: 'wp'},
        1: {a: 'wr', b: 'wn', c: 'wb', d: 'wq', e: 'wk', f: 'wb', g: 'wn', h: 'wr'},
    })

    // const [pieces, set_pieces] = useState({
    //     a8: 'br', 
    //     b8: 'bn',
    //     c8: 'bb',
    //     d8: 'bq',
    //     e8: 'bk',
    //     f8: 'bb',
    //     g8: 'bn',
    //     h8: 'br',
    //     a7: 'bp',
    //     b7: 'bp',
    //     c7: 'bp',
    //     d7: 'bp',
    //     e7: 'bp',
    //     f7: 'bp',
    //     g7: 'bp',
    //     h7: 'bp',
    //     a2: 'wp',
    //     b2: 'wp',
    //     c2: 'wp',
    //     d2: 'wp',
    //     e2: 'wp',
    //     f2: 'wp',
    //     g2: 'wp',
    //     h2: 'wp',
    //     a1: 'wr', 
    //     b1: 'wn',
    //     c1: 'wb',
    //     d1: 'wq',
    //     e1: 'wk',
    //     f1: 'wb',
    //     g1: 'wn',
    //     h1: 'wr'
    // })

    const [selected_piece, set_selected_piece] = useState(null)

    function square_click(rank, num) {
        if (!selected_piece) {
            set_selected_piece({
                piece: board[num][rank],
                rank: rank,
                num: num
            })
        } else if (board[selected_piece.num][selected_piece.rank] !== ' ') {
            // TODO: check for valid move
            if (selected_piece.num === num) {
                set_board(prev => ({
                    ...prev,
                    [selected_piece.num]: {
                        ...prev[selected_piece.num],
                        [selected_piece.rank]: ' ',
                        [rank]: selected_piece.piece
                    },
                }))
            } else {
                set_board(prev => ({
                    ...prev,
                    [selected_piece.num]: {
                        ...prev[selected_piece.num],
                        [selected_piece.rank]: ' '
                    },
                    [num]: {
                        ...prev[num],
                        [rank]: selected_piece.piece,
                    }
                }))
            }


            let temp_board = 

            set_selected_piece(null)
        } else if (board[selected_piece.num][selected_piece.rank] === ' ') {
            set_selected_piece(null)
        }
    }
    
    return <div id='board' style={{display: 'inline-flex', borderRadius: '5px', overflow: 'hidden'}}>
        <svg width={8 * size} height={8 * size}>
            {
                rows.map((num, r) => {
                    return cols.map((rank, c) => {
                        const piece_is_selected = selected_piece && selected_piece.num === num && selected_piece.rank === rank
                        const color = piece_is_selected ? yellow_tint(color_of_cell(num, rank)) : color_of_cell(num, rank)
                        return <rect
                            id={`${rank}${num}`}
                            key={`${rank}${num}`}
                            width={size}
                            height={size}
                            x={c * size}
                            y={r * size}
                            fill={color}
                            onClick={() => square_click(rank, num)}
                        />
                    })
                })
            }
            {
                cols.map((ch, c) => {
                    return <text
                        key={ch}
                        x={(c + 0.8) * size}
                        y={7.9 * size}
                        fontWeight={600}
                        fontSize='24'
                        fill={c % 2 == 1 ? black_board_color : white_board_color}
                    >
                        {ch}
                    </text>
                })
            }
            {
                rows.map((num, r) => {
                    return <text
                        key={num}
                        x={size * 0.07}
                        y={r * size + size * 0.25}
                        fontWeight={600}
                        fontSize='24'
                        fill={r % 2 == 0 ? black_board_color : white_board_color}
                    >
                        {num}
                    </text>
                })
            }
            {
                rows.map((num, r) => {
                    return cols.map((rank, c) => {
                        let piece = board[num][rank]
                        if (piece !== ' ')
                        return <image
                            key={`${rank}${num}`}
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

function color_of_cell(num, rank) {
    return ((rank.charCodeAt(0) - 'a'.charCodeAt(0)) + num) % 2 == 1 ? black_board_color : white_board_color
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