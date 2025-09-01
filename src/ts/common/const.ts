
/**
 * 駒の色を表すEnum
 */
export enum PieceColor {
    Black = 1,
    White = 2,
}

export namespace PieceColor {
  export function byPieceState(state: PieceState): PieceColor | null {
    switch (state) {
        case PieceState.Black:
        case PieceState.BlackSole:
            return PieceColor.Black;
        case PieceState.White:
        case PieceState.WhiteSole:
            return PieceColor.White;
        default:
            return null;
    }
  }
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

export namespace PieceState {
  export function isSole(state: PieceState): boolean {
    switch (state) {
        case PieceState.BlackSole:
        case PieceState.WhiteSole:
            return true;
        default:
            return false;
    }
  }
}

/**
 * 決着理由を表すEnum
 */
export enum SettledReason {
    FiveLinedUp = 0,
    Conced = 1,
    WhereToPlaceIsGone = 2,
}
