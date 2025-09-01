
import { Command } from 'commander';
import { AIPlayerDeepQLearning } from '../ts/aiPlayerDeepQLearning/aiPlayerDeepQLearning';
import { Board } from '../ts/board';
import { PieceColor } from '../ts/common/const';

const program = new Command();

program
    .name('gothello-cli')
    .description('CLI for managing the Gothello AI')
    .version('1.0.0');

const deepQLearningCommand = program.command('deep-q-learning').description('Manage the Deep Q-learning AI');

deepQLearningCommand
    .command('train')
    .description('Train the Deep Q-learning AI')
    .option('-e, --episodes <number>', 'Number of episodes to train for', '10000')
    .option('-o, --output <path>', 'Path to save the trained model', 'dqn-model')
    .action(async (options) => {
        const episodes = parseInt(options.episodes);
        const board = new Board();
        const ai = new AIPlayerDeepQLearning('DeepQLearningAI', PieceColor.Black, board, true);
        console.log(`Training for ${episodes} episodes...`);
        await ai.train(episodes);
        await ai.saveModel(options.output);
    });

program.parse(process.argv);
