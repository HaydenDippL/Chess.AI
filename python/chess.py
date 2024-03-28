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

def move_rook(curr_board, from_loc, to_loc):
    from_rank, from_file = int(from_loc[0]), from_loc[1]
    to_rank, to_file = int(to_loc[0]), to_loc[1]

    same_file = from_file == to_file
    same_rank = from_rank == to_rank
    if not same_file and not same_rank: 
        return False
    while from_file != to_file and curr_board[rank_file_to_index(from_rank, from_file)] == '.': 
        from_file += 1
    while from_rank[1] != to_rank[1] and curr_board[rank_file_to_index(from_rank, from_file)] == '.': 
        from_rank += 1
    return from_file == to_file and from_rank == to_rank

def move_knight(from_loc, to_loc):
    from_rank, from_file = int(from_loc[0]), from_loc[1]
    to_rank, to_file = int(to_loc[0]), to_loc[1]

    rank_diff = abs(from_rank - to_rank)
    file_diff = abs(from_file - to_file)
    return rank_diff == 1 and file_diff == 2 or rank_diff == 2 and file_diff == 1

def move_bishop(curr_board, from_loc, to_loc):
    from_rank, from_file = int(from_loc[0]), from_loc[1]
    to_rank, to_file = int(to_loc[0]), to_loc[1]

    rank_diff = abs(from_rank - to_rank)
    file_diff = abs(from_file - to_file)
    if rank_diff != file_diff:
        return False
    while from_rank < to_rank and from_file < to_file and curr_board[rank_file_to_index(from_rank, from_file)] == '.':
        from_rank += 1
        from_file += 1
    while from_rank < to_rank and from_file > to_file and curr_board[rank_file_to_index(from_rank, from_file)] == '.':
        from_rank += 1
        from_file -= 1
    while from_rank > to_rank and from_file < to_file and curr_board[rank_file_to_index(from_rank, from_file)] == '.':
        from_rank -= 1
        from_file += 1
    while from_rank > to_rank and from_file > to_file and curr_board[rank_file_to_index(from_rank, from_file)] == '.':
        from_rank -= 1
        from_file -= 1
    return from_rank == to_rank and from_file == to_file

def move_queen(curr_board, from_loc, to_loc):
    from_rank, from_file = int(from_loc[0]), from_loc[1]
    to_rank, to_file = int(to_loc[0]), to_loc[1]
    
    rook_move = from_rank == to_rank or from_file == to_file
    bishop_move = abs(from_rank - to_rank) == abs(from_file - to_file)
    if not rook_move and not bishop_move:
        return False
    elif rook_move:
        return rook_move(curr_board, from_loc, to_loc)
    else:
        return bishop_move(curr_board, from_loc, to_loc)

def move_king(curr_board, from_loc, to_loc):
    from_rank, from_file = int(from_loc[0]), from_loc[1]
    to_rank, to_file = int(to_loc[0]), to_loc[1]
    return max(abs(from_rank - to_rank), abs(from_file - to_file)) == 1
    
    
def is_valid_move(curr_board, from_loc, to_loc):
    # TODO: check that the piece is in the bounds of the board
    # TODO: check if this move would put my king in check (skewered)
    # TODO: if moving king, am I moving into check
    # TODO: check that you are not capturing your own piece

    piece = curr_board[rank_file_to_index(from_loc[0], from_loc[1])]
    white = int(piece) >= 'a'
    piece = piece.lower()

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