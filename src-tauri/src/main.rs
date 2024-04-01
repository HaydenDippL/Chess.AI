// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn rank_to_index(rank: i8) -> i8 {
    return rank - 8;
}

fn file_to_index(file: char) -> i8 {
    return file - 'a';
}

fn get_dir_file_rank(from_file: char, from_rank: isize, to_file: char, to_rank: isize) -> (isize, isize) {
    let mut file_dir: isize = to_file - from_file;
    file_dir = if file_dir < -1 { -1 } else if file_dir > 1 { 1 };

    let mut rank_dir: isize = to_rank - from_rank;
    rank_dir = if rank_dir < -1 { -1 } else if rank_dir > 1 { 1 };
    
    return file_dir, rank_dir;
}

fn iterate_dir(board: [[char; 8]; 8], rank: isize, file: isize, rank_dir: isize, file_dir: isize) -> (isize, isize) {
    rank_dir = if rank_dir < -1 { -1 } else if rank_dir > 1 { 1 };
    file_dir = if file_dir < -1 { -1 } else if file_dir > 1 { 1 };

    while rank < 7 && rank > 2 && file < 'g' && file > 'b' && board[rank_to_index(rank)][file_to_index(file)] == ' ' {
        rank += rank_dir;
        file += file_dir;
    }

    return (file, rank);
}

fn iterate_target(board: [[char; 8]; 8], from_file: isize, from_rank: isize, to_file: isize, to_rank: isize) -> (isize, isize) {
    let (file_dir, rank_dir) = get_dir_file_rank(from_file, from_rank, to_file, to_rank);

    while to_file != from_file && to_rank != from_rank && board[rank_to_index(rank)][file_to_index(file)] == ' ' {
        rank += rank_dir;
        file += file_dir;
    }
    
    return (from_file, from_rank);
}

fn square_under_attack(board: [[char; 8]; 8], white: bool, file: isize, rank: isize) {
    
    let attacking_pawn_rank = if white { rank + 1 } else { rank - 1 };
    let attacking_pawn_char = if white { 'p' } else { 'P' };
    let attacking_rook_char = if white { 'r' } else { 'R' };
    let attacking_knight_char = if white { 'n' } else { 'N' };
    let attacking_bishop_char = if white { 'b' } else { 'B' };
    let attacking_queen_char = if white { 'q' } else { 'Q' };
    let attacking_king_char = if white { 'k' } else { 'K' };

    // pawn
    if (file + 1 <= 'h' && board[rank_to_index(attacking_pawn_rank)][file_to_index(file + 1)] == attacking_pawn_char ||
        file - 1 >= 'a' && board[rank_to_index(attacking_pawn_rank)][file_to_index(file - 1)] == attacking_pawn_char) {
            return true;
    }

    // knight              // (file, rank)
    for knight_move_dir in [(1, 2), (2, 1), (2, -1), (1, -2), (-1, -2), (-2, -1), (-2, 1), (1, 2)] {
        let (file_dir, rank_dir) = knight_move_dir;
        if (file + file_dir >= 'a' && file + file_dir <= 'h' &&
            rank + rank_dir >= 1 && rank + rank_dir <= 8 &&
            board[rank_to_index(rank + rank_dir)][file_to_index(file + file_dir)] == attacking_knight_char)
                return true;
    }

    // rank / file
    for dirs in [(0, 1), (1, 0), (0, -1), (-1, -1)] {
        let (file_dir, rank_dir) = dirs;
        let (temp_file, temp_rank) = iterate_dir(board, rank, file, rank_dir, file_dir);
        let distance = abs(temp_file - file) + abs(temp_rank - rank);
        let temp_piece = board[rank_to_index(temp_rank)][file_to_index(temp_file)];
        if (temp_piece == attacking_queen_char || temp_piece == attacking_rook_char || 
            (distance == 1 && temp_piece == attacking_king_char)) {
                return true;
            } 
    }

    // diag
    for dirs in [(1, 1), (1, -1), (-1, -1), (-1, 1)] {
        let (file_dir, rank_dir) = dirs;
        let (temp_file, temp_rank) = iterate_dir(board, rank, file, rank_dir, file_dir);
        let distance = abs(temp_file - file);
        let temp_piece = board[rank_to_index(temp_rank)][file_to_index(temp_file)];
        if (temp_piece == attacking_queen_char || temp_piece == attacking_queen_char ||
            (distance == 1 && temp_piece == attacking_king_char)) {
                return true;
            }
    }

    return false;
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command(rename_all = "snake_case")]
fn valid_move(mut board: [[char; 8]; 8], a8r_still: bool, bk_still: bool, h8r_still: bool, a1r_still: bool, wk_still: bool, h1r_still: bool, bk: String, wk: String, from_rank: i8, from_file: char, to_rank: i8, to_file: char) -> bool {
    // TODO: en passant
    
    let mut piece: char = board[rank_to_index(from_rank)][file_to_index(from_file)];
    let white: bool = piece < 'a';
    piece = piece.to_lowercase();
    
    // check that my piece is not capturing my own piece
    {
        let to_piece = board[rank_to_index(to_rank)][file_to_index(to_file)];
        if to_piece != ' ' && !(to_piece < 'a'^ white) {
            return false;
        }
    }
    
    // check that my piece is moving to a different square
    if from_rank == to_rank && from_file == to_file {
        return false;
    }

    // check that my move is in the bounds of the board
    if to_rank < 1 || to_rank > 8 || to_file < 'a' || to_file > 'h' {
        return false;
    }

    // check that for the piece it is allowed to move that way
    // ie rook moves horizontal and can't hit jump pieces ...
    let piece_can_move: bool = {
        match piece {
            'p' => {
                if (white) {
                    if (from_file == to_file) { // no capture
                        if (to_rank - from_rank == 1) { // moves one square
                            return board[rank_to_index(to_rank)][file_to_index(to_file)] == ' ';
                        } else if (to_rank - from_rank == 2) { // double move
                            return from_rank == 2 &&
                                board[rank_to_index(to_rank - 1)][file_to_index(to_file)] == ' ' &&
                                board[rank_to_index(to_rank)][file_to_index(to_file)] == ' ';
                        } else {
                            return false;
                        }
                    } else if (abs(to_file - from_file) == 1 && to_rank - from_rank == 1) { // capture
                        if (board[rank_to_index(from_rank)][file_to_index(from_file)] == ' ') { // en passant
                            
                        } else {
                            return true;
                        }
                    } else {
                        return false;
                    }
                } else { // black
                    if (from_file == to_file) { // no capture
                        if (to_rank - from_rank == -1) { // moves one square
                            return board[rank_to_index(to_rank)][file_to_index(to_file)] == ' ';
                        } else if (to_rank - from_rank == -2) { // double move
                            return from_rank == 7 &&
                                board[rank_to_index(to_rank + 1)][file_to_index(to_file)] == ' ' &&
                                board[rank_to_index(to_rank)][file_to_index(to_file)] == ' ';
                        } else {
                            return false;
                        }
                    } else if (abs(to_file - from_file) == 1 && to_rank - from_rank == 1) { // capture
                        if (board[rank_to_index(from_rank)][file_to_index(from_file)] == ' ') { // en passant

                        } else {
                            return true;
                        }
                    } else {
                        return false;
                    }
                }
            },
            'r' => {
                let same_file: bool = from_file == to_file;
                let same_rank: bool = from_rank == to_rank;
                if !same_file && !same_rank {
                    return false;
                } else {
                    let (file, rank) = iterate_target(board, from_file, from_rank, to_file, to_rank);
                    return file == to_file && rank == to_rank;
                }
            },
            'n' => {
                let file_diff: isize = abs(to_file - from_file);
                let rank_diff: isize = abs(to_rank - from_rank);
                return file_diff == 2 && rank_diff == 1 || file_diff == 1 && rank_diff == 2;
            },
            'b' => {
                let file_diff: isize = abs(to_file - from_file);
                let rank_diff: isize = abs(to_rank - from_rank);
                if (file_diff != rank_diff) {
                    return false;
                } else {
                    let (file, rank) = iterate_target(board, from_file, from_rank, to_file, to_rank);
                    return file == to_file && rank == to_rank;
                }
            },
            'k' => {
                // castle
                if (white && from_file == 'e' && from_rank == 1 && to_file == 'g' && to_rank == 1) {
                    // white short castle
                    if (!wk_still || !h1r_still) {
                        return false;
                    }
                    let (temp_file, _) = iterate_dir(board, from_file, from_rank, 1, 0);
                    if temp_file != 'h' && board[1]['h'] == 'R' {
                        return false;
                    }
                    if (square_under_attack(board, white, 'e', 1) ||
                        square_under_attack(board, white, 'f', 1) ||
                        square_under_attack(board, white, 'g', 1)) {
                            return false;
                    }
                } else if (white && from_file == 'e' && from_rank == 1 && to_file == 'c' && to_rank == 1) {
                    // white long castle
                    if (!wk_still || !a1r_still) {
                        return false;
                    }
                    let (temp_file, _) = iterate_dir(board, from_file, from_rank, -1, 0);
                    if temp_file != 'a' && board[1]['a'] == 'R' {
                        return false;
                    }
                    if (square_under_attack(board, white, 'e', 1) ||
                        square_under_attack(board, white, 'd', 1) ||
                        square_under_attack(board, white, 'c', 1)) {
                            return false;
                    }
                } else if (!white && from_file == 'e' && from_rank == 8 && to_file == 'g' && to_rank == 8) {
                    // black short castle
                    if (!bk_still || !h8r_still) {
                        return false;
                    }
                    let (temp_file, _) = iterate_dir(board, from_file, from_rank, 1, 0);
                    if temp_file != 'h' && board[8]['h'] == 'r' {
                        return false;
                    }
                    if (square_under_attack(board, white, 'e', 8) ||
                        square_under_attack(board, white, 'f', 8) ||
                        square_under_attack(board, white, 'g', 8)) {
                            return false;
                    }
                } else if (!white && from_file == 'e' && from_rank == 8 && to_file == 'c' && to_rank == 8) {
                    // black long castle
                    if (!bk_still || !a8r_still) {
                        return false;
                    }
                    let (temp_file, _) = iterate_dir(board, from_file, from_rank, -1, 0);
                    if temp_file != 'h' && board[8]['a'] == 'r' {
                        return false;
                    }
                    if (square_under_attack(board, white, 'e', 8) ||
                        square_under_attack(board, white, 'd', 8) ||
                        square_under_attack(board, white, 'c', 8)) {
                            return false;
                    }
                } else { // not a castle
                    // make sure the king move is a king move
                    let file_diff: isize = abs(to_file - from_file);
                    let rank_diff: isize = abs(to_rank - from_rank);
                    if (file_diff > 1 || rank_diff > 1) {
                        return false;
                    }

                    // make sure the king did not move into check
                    if (square_under_attack(board, white, to_file, to_rank)) {
                        return false;
                    }
                }
            },
            'q' => {
                let rook_move: bool = from_file == to_file || from_rank == to_rank;
                let bishop_move: bool = abs(to_file - from_file) == abs(to_rank - from_rank);
                if !rook_move && !bishop_move {
                    return false;
                } else {
                    let (file, rank) = iterate_target(board, from_file, from_rank, to_file, to_rank);
                    return file == to_file && rank == to_rank;
                }
            },
            _ => {
                return true;
            }
        }
    }
    
    // move piece
    board[rank_to_index(rank)][file_to_index(file)] = board[rank_to_index(from_rank)][file_to_index(from_file)];
    board[rank_to_index(from_rank)][file_to_index(from_file)] = ' ';

    // check that king is not skewered
    {
        same_rank: bool = from_rank == to_rank;
        same_file: bool = from_file == to_file;
        if (same_rank) {
            let (file_dir, rank_dir) = get_dir_file_rank(from_file, from_rank, to_file, to_rank);
            let (file, rank) = iterate_dir(board, rank, file, rank_dir, file_dir);
            let mut attacking_piece = board[rank_to_index(rank)][file_to_index(rank)];
            let attacking_white = attacking_piece <= 'a';
            attacking_piece = attacking_piece.to_lowercase();
            if (attacking_piece != ' ' && (attacking_white ^ white) &&
                attacking_piece == 'q' || attacking_piece == 'r') {
                    return false;
            }
        } if (same_file) {
            let (file_dir, rank_dir) = get_dir_file_rank(from_file, from_rank, to_file, to_rank);
            let (file, rank) = iterate_dir(board, rank, file, rank_dir, file_dir);
            let mut attacking_piece = board[rank_to_index(rank)][file_to_index(rank)];
            let attacking_white = attacking_piece <= 'a';
            attacking_piece = attacking_piece.to_lowercase();
            if (attacking_piece != ' ' && (attacking_white ^ white) &&
                attacking_piece == 'q' || attacking_piece == 'b') {
                    return false;
            }
        }
    }


    if board[rank_to_index(to_rank)][file_to_index(to_file)] <= 'a' ^ white

    // if castle
    // if en passent
    // if 
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![valid_move])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
