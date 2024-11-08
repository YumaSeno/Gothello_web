
/**
 * 駒の色を表すEnumもどき
 */
export const PieceColor = Object.freeze({
    Black: 1,
    White: 2,

    /** 
     * 値から名前を返す
     * 存在しない値の場合は空文字を返す
     */
    valueToName: (value)=>{
        switch(value){
            case 1: return "Black";
            case 2: return "White";
        }
        return "";
    },

    /** 
     * 名前から値を返す
     * 存在しない名前の場合は-1を返す
     */
    nameToValue: (name)=>{
        switch(name){
            case "Black": return 1;
            case "White": return 2;
        }
        return -1;
    },
});

/**
 * 駒の状態を表すEnumもどき
 */
export const PieceState = Object.freeze({
    Empty: 0,
    Black: 1,
    White: 2,
    BlackSole: 3,
    WhiteSole: 4,

    /** 
     * 値から名前を返す
     * 存在しない値の場合は空文字を返す
     */
    valueToName: (value)=>{
        switch(value){
            case 0: return "Empty";
            case 1: return "Black";
            case 2: return "White";
            case 3: return "BlackSole";
            case 4: return "WhiteSole";
        }
        return "";
    },

    /** 
     * 名前から値を返す
     * 存在しない名前の場合は-1を返す
     */
    nameToValue: (name)=>{
        switch(name){
            case "Empty": return 0;
            case "Black": return 1;
            case "White": return 2;
            case "BlackSole": return 3;
            case "WhiteSole": return 4;
        }
        return -1;
    },
});

/**
 * 決着理由を表すEnumもどき
 */
export const SettledReason = Object.freeze({
    FiveLinedUp: 0,
    Conced: 1,
    WhereToPlaceIsGone: 2,

    /** 
     * 値から名前を返す
     * 存在しない値の場合は空文字を返す
     */
    valueToName: (value)=>{
        switch(value){
            case 0: return "FiveLinedUp";
            case 1: return "Conceded";
            case 2: return "WhereToPlaceIsGone";
        }
        return "";
    },

    /** 
     * 名前から値を返す
     * 存在しない名前の場合は-1を返す
     */
    nameToValue: (name)=>{
        switch(name){
            case "FiveLinedUp": return 0;
            case "Conceded": return 1;
            case "WhereToPlaceIsGone": return 2;
        }
        return -1;
    },
});
