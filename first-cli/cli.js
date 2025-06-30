#!/usr/bin/env node

import inquirer from 'inquirer';
import chalk from 'chalk';
import figlet from 'figlet';
import gradient from 'gradient-string';
import boxen from 'boxen';
import cliSpinners from 'cli-spinners';

console.log(cliSpinners.dots);
// Create a beautiful title
console.log(
  gradient.pastel.multiline(
    figlet.textSync('CLI Menu', {
      font: 'Big',
      horizontalLayout: 'default',
      verticalLayout: 'default',
    })
  )
);

const menuOptions = [
  {
    type: 'list',
    name: 'action',
    message: 'What would you like to do?',
    choices: [
      {
        name: `${chalk.green('✨')} Start New Project`,
        value: 'new',
      },
      {
        name: `${chalk.blue('🔍')} Search Files`,
        value: 'search',
      },
      {
        name: `${chalk.yellow('⚙️')} Configure Settings`,
        value: 'settings',
      },
      {
        name: `${chalk.red('⬅️')} Exit`,
        value: 'exit',
      },
    ],
  },
];

async function main() {
  try {
    const response = await inquirer.prompt(menuOptions);
    
    switch (response.action) {
      case 'new':
        console.log(
          boxen(chalk.green('Starting new project...'), {
            padding: 1,
            margin: 1,
            borderStyle: 'round',
            borderColor: 'green',
          })
        );
        break;
      case 'search':
        console.log(
          boxen(chalk.blue('Searching files...'), {
            padding: 1,
            margin: 1,
            borderStyle: 'round',
            borderColor: 'blue',
          })
        );
        break;
      case 'settings':
        console.log(
          boxen(chalk.yellow('Opening settings...'), {
            padding: 1,
            margin: 1,
            borderStyle: 'round',
            borderColor: 'yellow',
          })
        );
        break;
      case 'exit':
        console.log(
          boxen(chalk.red('Goodbye! 👋'), {
            padding: 1,
            margin: 1,
            borderStyle: 'round',
            borderColor: 'red',
          })
        );
        process.exit(0);
    }
  } catch (error) {
    console.error(chalk.red('Error:'), error);
  }
}

main();
