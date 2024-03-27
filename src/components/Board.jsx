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

    const [selected_piece, set_selected_piece] = useState(null)


    function square_click(rank, num) {
        if (selected_piece) {
            set_board(prev => ({
                ...prev,
                [num]: {
                    ...prev[num],
                    [rank]: selected_piece.piece,
                },
                [selected_piece.prev_num]: {
                    ...prev[selected_piece.prev_num],
                    [selected_piece.prev_rank]: ' '
                }
            }))

            set_selected_piece(null)
        } else {
            set_selected_piece({
                piece: board[num][rank],
                prev_rank: rank,
                prev_num: num
            })
        }


    }

    function drop_piece() {
        console.log("Dropping")

        set_board(prev => ({
            ...prev,
            [grabbed_piece.prev_num]: {
                ...prev[grabbed_piece.prev_num],
                [grabbed_piece.prev_rank]: grabbed_piece.piece
            }
        }))

        set_grabbed_piece(null)
    }

    function high_light_square(rank, num) {

    }
    
    return <div id='board' style={{display: 'inline-flex', borderRadius: '5px', overflow: 'hidden'}}>
        <svg width={8 * size} height={8 * size}>
            {
                rows.map((num, r) => {
                    return cols.map((rank, c) => {
                        return <rect
                            id={`${rank}${num}`}
                            key={`${rank}${num}`}
                            width={size}
                            height={size}
                            x={c * size}
                            y={r * size}
                            fill={color_of_cell(num, rank)}
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
                            style={{pointerEvents: 'none'}}
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