# Board
# 8 r n b q k b n r
# 7 p p p p p p p p
# 6 . . . . . . . .
# 5 . . . . . . . .
# 4 . . . P . . . .
# 3 . . . . . . . .
# 2 P P P . P P P P
# 1 R N B Q K B N R
#   a b c d e f g h
# 111111 // needed to know if castling is legal
# e1 // white king location
# e8 // black king location

# 1 // a1r hasnt moved
# 1 // wk hasnt moved
# 1 // h1r hasnt moved
# 1 // a8r hasnt moved
# 1 // bk hasnt moved
# 1 // h8r hasnt moved

def rank_file_to_index(rank, file):
    return 18 * (8 - rank) + 2 * (int(file) - int('a') + 1)

def is_castle_legal(is_white, is_short):
    pass

def is_en_passant_legal(attacking_pawn, victim_pawn):
    pass

# piece
# e7

# move
# e5

# Iterates a piece in a specified direction (rank and file) until it
# hits another piece, hits the end of the board, or it hits a target
def iterate_piece(curr_board, rank, file, rank_dir=0, file_dir=0, target_rank=None, target_file=None):
    min_rank, max_rank, min_file, max_file = 1, 8, 'a', 'h'
    if (not rank_dir and not file_dir) and (not target_rank or not target_file): return False
    if not rank_dir: rank_dir = clip(target_rank - rank)
    if not file_dir: file_dir = clip(target_file - file)

    while (rank > min_rank and rank < max_rank and
           file > min_file and file < max_file and
           target_rank != rank and target_file != file and
           curr_board[rank_file_to_index(rank, file)] == '.'):
        rank += rank_dir
        file += file_dir
    return file, rank

def clip(num, min=-1, max=1):
    return max if num >= max else num if num >= min else min

def move_rook(curr_board, from_rank, from_file, to_rank, to_file):
    same_file = from_file == to_file
    same_rank = from_rank == to_rank
    if not same_file and not same_rank: return False

    dest_file, dest_rank = iterate_piece(curr_board, from_rank, from_file, target_file=to_file, target_rank=to_rank)
    
    return dest_file == to_file and dest_rank == to_rank

def move_knight(from_rank, from_file, to_rank, to_file):
    rank_diff = abs(from_rank - to_rank)
    file_diff = abs(from_file - to_file)
    return rank_diff == 1 and file_diff == 2 or rank_diff == 2 and file_diff == 1

def move_bishop(curr_board, from_rank, from_file, to_rank, to_file):
    rank_diff = abs(from_rank - to_rank)
    file_diff = abs(from_file - to_file)
    if rank_diff != file_diff: return False

    dest_file, dest_rank = iterate_piece(curr_board, from_rank, from_file, target_file=to_file, target_rank=to_rank)

    return dest_file == to_file and dest_rank == to_rank

def move_queen(curr_board, from_rank, from_file, to_rank, to_file):
    rook_move = from_rank == to_rank or from_file == to_file
    bishop_move = abs(from_rank - to_rank) == abs(from_file - to_file)
    if not rook_move and not bishop_move:
        return False
    elif rook_move:
        return rook_move(curr_board, from_rank, from_file, to_rank, to_file)
    else:
        return bishop_move(curr_board, from_rank, from_file, to_rank, to_file)

def move_king(curr_board, from_rank, from_file, to_rank, to_file):
    return max(abs(from_rank - to_rank), abs(from_file - to_file)) == 1

def king_is_skewered(curr_board, from_rank, from_file, to_rank, to_file, king_rank, king_file, white_move):
    from_index, to_index = rank_file_to_index(from_rank, from_file), rank_file_to_index(to_file, to_rank)
    curr_board[to_index] = curr_board[from_index]
    curr_board[from_index] = '.'

    if king_rank == from_rank:
        dest_file, dest_rank = iterate_piece(curr_board, king_rank, king_file, rank_dir=clip(from_rank - king_rank))
        piece = curr_board[rank_file_to_index(dest_rank, dest_file)]
        return piece.lower() not in ['q', 'r']
    elif king_file == from_file:
        iterate_piece(curr_board, king_rank, king_file, file_dir=clip(from_file - king_file))
        piece = curr_board[rank_file_to_index(dest_rank, dest_file)]
        return piece.lower() not in ['q', 'r']
    elif abs(king_rank - from_rank) == abs(king_file - from_file):
        dest_file, dest_rank = iterate_piece(curr_board, king_rank, king_file, rank_dir=clip(from_rank - king_rank), file_dir=clip(from_file - king_file))
        piece = curr_board[rank_file_to_index(dest_rank, dest_file)]
        return piece.lower() not in ['q', 'b']
    
def is_valid_move(curr_board, from_loc, to_loc, white_king, black_king):
    # TODO: if moving king, am I moving into check
    # TODO: check pawn double move
    # TODO: check en passent
    # TODO: check castling

    from_rank, from_file = int(from_loc[0]), from_loc[1]
    to_rank, to_file = int(to_loc[0]), to_loc[1]
    white_king_rank, white_king_file = int(white_king[0]), white_king[1]
    black_king_rank, black_king_file = int(black_king[0]), black_king[1]

    piece = curr_board[rank_file_to_index(from_loc[0], from_loc[1])]
    white_move = int(piece) >= 'a'
    piece = piece.lower()

    # check that piece is moving in bounds of the board
    if to_rank > 8 or to_rank < 1 or to_file < 'a' or to_file > 'a':
        return False
    
    # check that you are not capturing your own piece
    if curr_board[rank_file_to_index(to_rank, to_file)] > 'a' ^ white_move:
        return False
    
    # check that I am not moving out of a skewer on the my king
    king_rank, king_file = int(white_king[0]), white_king[1] if white_move else int(black_king[0]), black_king[1]
    if piece != 'k' and king_is_skewered(curr_board, from_rank, from_file, to_rank, to_file, king_rank, king_file, white_move):
        return False
    
    #

    match piece:
        case 'p':
            pass
        case 'r':
            return move_rook(curr_board, from_loc, to_loc)
        case 'n':
            return move_knight(from_loc, to_loc)
        case 'b':
            return move_bishop(curr_board, from_loc, to_loc)
        case 'q':
            return move_queen(curr_board, from_loc, to_loc)
        case 'k':
            return move_king(curr_board, from_loc, to_loc)

    return False

    # check that piece can take that path

    # check that piece isn't blocked

    # if castle check validity

    # if en passant check validity