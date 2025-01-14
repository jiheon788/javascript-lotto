const { Console, Random } = require('@woowacourse/mission-utils');
const Lotto = require('./Lotto');
const { validator } = require('./utils');
const OutputView = require('./OutputView')
const { FORMULA, UNITS, MESSAGE, ERROR_MESSAGE } = require('./constants');
const InputView = require('./InputView');
const User = require('./User');

class App {
  numberOfLotto = 0;
  luckyNumbers = [];
  bonusNumber = 0;
  

  winningMap = {
    firstPlace: {
      count: 0,
      WINNING_AMOUNT: 2000000000,
    },
    secondPlace: {
      count: 0,
      WINNING_AMOUNT: 30000000,
    },
    thirdPlace: {
      count: 0,
      WINNING_AMOUNT: 1500000,
    },
    fourthPlace: {
      count: 0,
      WINNING_AMOUNT: 50000,
    },
    fifthPlace: {
      count: 0,
      WINNING_AMOUNT: 5000,
    },
  };

  play() {
    this.user = new User();
    this.requestInput();
  }

  requestInput() {
    InputView.readInput(this.pay.bind(this))
  }

  validateInput(input) {
    if (validator.isNotRightPay(input)) {
      throw new Error(ERROR_MESSAGE.PAY_AMOUNT);
    }
  }

  pay(response) {
    this.validateInput(Number(response));
    this.user.setPayAmount(Number(response));
    this.numberOfLotto = this.user.getPayAmount() / UNITS.LOTTO_PRICE;
    this.publish();
  };

  publish() {
    OutputView.printNumberOfLotto(this.numberOfLotto);

    let lottos = []
    for (let i = 0; i < this.numberOfLotto; i++) {
      const lotto = new Lotto(
        Random.pickUniqueNumbersInRange(
          UNITS.MIN,
          UNITS.MAX,
          UNITS.LIMIT_LOTTO,
        ),
      );
      lottos.push(lotto);
    }
    this.user.setMyLottos(lottos);
    this.printLottos();
    this.requestLuckyNumbers();
    return;
  }

  printLottos() {
    this.user.getMyLottos().map((myLotto) => {
      OutputView.printLotto(myLotto.getNumbers());
    });
    return;
  }

  validate(luckyNumbers, bonusNumber) {
    if (validator.isLengthError(luckyNumbers)) {
      throw new Error(ERROR_MESSAGE.LENGTH_OF_LUCKY_NUMBERS);
    }
    if (validator.isDuplicate(luckyNumbers)) {
      throw new Error(ERROR_MESSAGE.DUPLICATE_OF_LUCKY_NUMBERS);
    }
    if (validator.isNotRightBonus(luckyNumbers, bonusNumber)) {
      throw new Error(ERROR_MESSAGE.DUPLICATE_OF_BONUS_NUMBER);
    }
    if (validator.isDigitError(luckyNumbers)) {
      throw new Error(ERROR_MESSAGE.DIGIT_OF_LOTTO);
    }
    if (validator.isNotIntegers(luckyNumbers)) {
      throw new Error(ERROR_MESSAGE.INTEGER_OF_LOTTO);
    }
    if (validator.isDigitError([bonusNumber])) {
      throw new Error(ERROR_MESSAGE.DIGIT_OF_LOTTO);
    }
    if (validator.isNotIntegers([bonusNumber])) {
      throw new Error(ERROR_MESSAGE.INTEGER_OF_LOTTO);
    }
  }

  requestLuckyNumbers() {
    InputView.readLuckyNumbers(this.setLuckyNumbers.bind(this));
  }

  setLuckyNumbers(response) {
    this.luckyNumbers = response.split(',').map(Number);
    this.requestBonusNumbers();

    return;
  }

  requestBonusNumbers() {
    InputView.readBonusNumber(this.setBonusNumber.bind(this));
  }

  setBonusNumber(response) {
      this.bonusNumber = Number(response);
      this.validate(this.luckyNumbers, this.bonusNumber);
      this.winning();
  }

  winning() {
    this.match();
    this.end();
  }

  match() {
    this.user.getMyLottos().map((myLotto) => {
      let numberOfMatch = myLotto.countNumberOfMatches(this.luckyNumbers);
      let isBonus = myLotto.isBonus(this.bonusNumber);

      if (numberOfMatch === 3) {
        this.winningMap.fifthPlace.count += 1;
      } else if (numberOfMatch === 4) {
        this.winningMap.fourthPlace.count += 1;
      } else if (numberOfMatch === 5 && !isBonus) {
        this.winningMap.thirdPlace.count += 1;
      } else if (numberOfMatch === 5 && isBonus) {
        this.winningMap.secondPlace.count += 1;
      } else if (numberOfMatch === 6) {
        this.winningMap.firstPlace.count += 1;
      }
    });

    this.user.calculate(this.winningMap);
  }

  end() {
    OutputView.printResult(this.winningMap, this.user.getProfit());
    Console.close();
  }
}

const app = new App();
app.play()

module.exports = App;
