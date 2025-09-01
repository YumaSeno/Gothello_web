
/**
 * 駒の色を表すEnum
 */
export enum PieceColor {
    Black = 1,
    White = 2,
}

/**
 * 駒の状態を表すEnum
 */
export enum PieceState {
    Empty = 0,
    Black = 1,
    White = 2,
    BlackSole = 3,
    WhiteSole = 4,
}

/**
 * 決着理由を表すEnum
 */
export enum SettledReason {
    FiveLinedUp = 0,
    Conced = 1,
    WhereToPlaceIsGone = 2,
}
