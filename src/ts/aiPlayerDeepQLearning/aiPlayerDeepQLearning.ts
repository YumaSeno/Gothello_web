'use strict';
import * as tf from '@tensorflow/tfjs';
import { _PlayerInterface } from "../player"
import { PieceColor, PieceState } from "../common/const";
import { Board } from "../board";

// Conditionally load the backend for Node.js
if (typeof window === 'undefined') {
  require('@tensorflow/tfjs-node');
}

export class AIPlayerDeepQLearning extends _PlayerInterface {
    private model: tf.Sequential;
    private learningRate: number = 0.01;
    private discountFactor: number = 0.9;
    private explorationRate: number = 0.1;
    private memory: { state: PieceState[][], action: number, reward: number, nextState: PieceState[][], done: boolean }[] = [];
    private batchSize: number = 32;

    constructor(name: string, myColor: PieceColor, board: Board, isTraining: boolean = false) {
        super(name, myColor, board);
        this.model = this.createModel();
        setTimeout(() => this._placePieceInTheBestPlaces(), 500);

        if (!isTraining) {
            board.addEventListnerOnPlacesPiece((x, y) => {
                if (this._board!.getCurrentTurnColor() !== this._myColor) return;
                if (this._board!.isSettled()) return;
                setTimeout(() => this._placePieceInTheBestPlaces(), 500);
            });
        }
    }

    private createModel(): tf.Sequential {
        const model = tf.sequential();
        // Input layer: 9x9 board with 1 channel
        model.add(tf.layers.conv2d({
            inputShape: [9, 9, 1],
            filters: 32,
            kernelSize: 3,
            activation: 'relu',
            padding: 'same' // To maintain output size
        }));
        model.add(tf.layers.conv2d({
            filters: 64,
            kernelSize: 3,
            activation: 'relu',
            padding: 'same'
        }));
        model.add(tf.layers.conv2d({
            filters: 128,
            kernelSize: 3,
            activation: 'relu',
            padding: 'same'
        }));
        // Flatten the output of the convolutional layers
        model.add(tf.layers.flatten());
        // Output layer: 81 possible moves (9x9 board)
        model.add(tf.layers.dense({ units: 81, activation: 'linear' }));
        model.compile({ optimizer: tf.train.adam(this.learningRate), loss: 'meanSquaredError' });
        return model;
    }

    _placePiece(x: number, y: number) {
        if (this._board!.getCurrentTurnColor() == this._myColor) this._board!.placePiece(this._myColor!, x, y);
    }

    _conced() {
        if (this._board!.getCurrentTurnColor() == this._myColor) this._board!.conced(this._myColor!);
    }

    private getBoardStateTensor(board: PieceState[][]): tf.Tensor {
        const flatBoard = board.flat().map(p => {
            let state = -1;
            if (PieceColor.byPieceState(p) === this._myColor) state = 1;
            if (p === PieceState.Empty) state = 0;
            if (PieceState.isSole(p)) state *= 2;
            return state;
        });
        // Reshape to [1, 9, 9, 1] for conv2d input
        return tf.tensor4d(flatBoard, [1, 9, 9, 1]);
    }

    private getPossibleActions(board: PieceState[][], color: PieceColor): number[] {
        const actions: number[] = [];
        for (let y = 0; y < 9; y++) {
            for (let x = 0; x < 9; x++) {
                if (this._board!.canPlacePiece(board, color, x, y)) {
                    actions.push(y * 9 + x);
                }
            }
        }
        return actions;
    }

    public async chooseAction(board: PieceState[][], color: PieceColor): Promise<number> {
        const possibleActions = this.getPossibleActions(board, color);
        if (possibleActions.length === 0) return -1;

        if (Math.random() < this.explorationRate) {
            return possibleActions[Math.floor(Math.random() * possibleActions.length)];
        }

        const stateTensor = this.getBoardStateTensor(board);
        const qValues = await (this.model.predict(stateTensor) as tf.Tensor).data();
        stateTensor.dispose();

        let bestAction = -1;
        let maxQValue = -Infinity;

        for (const action of possibleActions) {
            if (qValues[action] > maxQValue) {
                maxQValue = qValues[action];
                bestAction = action;
            }
        }

        if (bestAction === -1) {
            return possibleActions[Math.floor(Math.random() * possibleActions.length)];
        }

        return bestAction;
    }

    public remember(state: PieceState[][], action: number, reward: number, nextState: PieceState[][], done: boolean) {
        this.memory.push({ state, action, reward, nextState, done });
    }

    public async replay() {
        if (this.memory.length < this.batchSize) {
            return;
        }

        const batch = this.memory.sort(() => 0.5 - Math.random()).slice(0, this.batchSize);

        for (const experience of batch) {
            const { state, action, reward, nextState, done } = experience;
            const stateTensor = this.getBoardStateTensor(state);
            let targetQ = reward;

            if (!done) {
                const nextStateTensor = this.getBoardStateTensor(nextState);
                const nextQValues = await (this.model.predict(nextStateTensor) as tf.Tensor).data();
                nextStateTensor.dispose();
                targetQ = reward + this.discountFactor * Math.max(...nextQValues);
            }

            const targetQValues = await (this.model.predict(stateTensor) as tf.Tensor).data() as Float32Array;
            targetQValues[action] = targetQ;

            const targetTensor = tf.tensor2d([Array.from(targetQValues)]);
            await this.model.fit(stateTensor, targetTensor, { epochs: 1, verbose: 0 });
            stateTensor.dispose();
            targetTensor.dispose();
        }
    }

    async _placePieceInTheBestPlaces() {
        const boardState = this._board!.getBoardCopy();
        const action = await this.chooseAction(boardState, this._myColor!);
        if (action !== -1) {
            const x = action % 9;
            const y = Math.floor(action / 9);
            this._placePiece(x, y);
        }
    }

    public async saveModel(filePath: string) {
        if (typeof window === 'undefined') { // Node.js environment
            try {
                // To use file system saving, we need to dynamically require the node backend.
                // For GPU acceleration, use '@tensorflow/tfjs-node-gpu'. For CPU, use '@tensorflow/tfjs-node'.
                const tfNode = require('@tensorflow/tfjs-node');
                const handler = tfNode.io.fileSystem(`${filePath}`)
                await this.model.save(handler);
                console.log(`Model saved to ${filePath}`);
            } catch (error) {
                console.error('Failed to save model in Node.js environment:', error);
            }
        } else {
            console.warn("Model saving is not supported in the browser via file path.");
        }
    }

    public async loadModel(filePath: string) {
        try {
            if (typeof window === 'undefined') { // Node.js environment
                // To use file system loading, we need to dynamically require the node backend.
                // For GPU acceleration, use '@tensorflow/tfjs-node-gpu'. For CPU, use '@tensorflow/tfjs-node'.
                require('@tensorflow/tfjs-node');
                const modelPath = `file://${filePath}/model.json`;
                this.model = await tf.loadLayersModel(modelPath) as tf.Sequential;
                console.log(`Model loaded from ${filePath}`);
            } else { // Browser environment
                const modelPath = `${filePath}/model.json`; // Assumes filePath is a URL path
                this.model = await tf.loadLayersModel(modelPath) as tf.Sequential;
                console.log(`Model loaded from ${filePath}`);
            }
            this.model.compile({ optimizer: tf.train.adam(this.learningRate), loss: 'meanSquaredError' });
        } catch (error) {
            console.log(`Could not load model from ${filePath}. Starting with a new one.`);
            this.model = this.createModel();
        }
    }

    public async train(episodes: number) {
        const startTime = Date.now();
        for (let i = 0; i < episodes; i++) {
            let board = new Board();
            let currentPlayerColor = PieceColor.Black;
            let done = false;

            while (!done) {
                const boardState = board.getBoardCopy();
                const possibleActions = this.getPossibleActions(boardState, currentPlayerColor);

                if (possibleActions.length === 0) {
                    board.conced(currentPlayerColor);
                    currentPlayerColor = board.getCurrentTurnColor();
                    continue;
                }

                const action = await this.chooseAction(boardState, currentPlayerColor);
                const x = action % 9;
                const y = Math.floor(action / 9);

                board.placePiece(currentPlayerColor, x, y);

                const nextBoardState = board.getBoardCopy();
                let reward = 0;
                done = board.isSettled();

                if (done) {
                    const winner = board.isVictory(nextBoardState, this._myColor!);
                    if (winner !== null) {
                        reward = 1;
                    } else {
                        reward = -1;
                    }
                }

                this.remember(boardState, action, reward, nextBoardState, done);

                currentPlayerColor = board.getCurrentTurnColor();
            }
            await this.replay();
            const progress = ((i / episodes) * 100).toFixed(2);
            const elapsedTime = Date.now() - startTime;
            const timePerEpisode = elapsedTime / (i + 1);
            const remainingEpisodes = episodes - (i + 1);
            const estimatedRemainingTime = remainingEpisodes * timePerEpisode;
            const eta = new Date(estimatedRemainingTime).toISOString().substr(11, 8);
            console.log(`Episode ${i}/${episodes} (${progress}%) finished. ETA: ${eta}`);
        }
        console.log('Training finished.');
    }
}