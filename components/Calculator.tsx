import React, { useState, useCallback } from 'react';
import Icon from './icons';

interface CalculatorProps {
    onClose: () => void;
}

const Calculator: React.FC<CalculatorProps> = ({ onClose }) => {
    const [displayValue, setDisplayValue] = useState('0');
    const [firstOperand, setFirstOperand] = useState<number | null>(null);
    const [operator, setOperator] = useState<string | null>(null);
    const [waitingForSecondOperand, setWaitingForSecondOperand] = useState(false);

    const inputDigit = useCallback((digit: string) => {
        if (waitingForSecondOperand) {
            setDisplayValue(digit);
            setWaitingForSecondOperand(false);
        } else {
            setDisplayValue(displayValue === '0' ? digit : displayValue + digit);
        }
    }, [displayValue, waitingForSecondOperand]);

    const inputDecimal = useCallback(() => {
        if (waitingForSecondOperand) {
            setDisplayValue('0.');
            setWaitingForSecondOperand(false);
            return;
        }
        if (!displayValue.includes('.')) {
            setDisplayValue(displayValue + '.');
        }
    }, [displayValue, waitingForSecondOperand]);

    const clearLastChar = () => {
        if (displayValue.length > 1) {
            setDisplayValue(displayValue.slice(0, -1));
        } else {
            setDisplayValue('0');
        }
    }

    const clearAll = () => {
        setDisplayValue('0');
        setFirstOperand(null);
        setOperator(null);
        setWaitingForSecondOperand(false);
    };

    const performOperation = (nextOperator: string) => {
        const inputValue = parseFloat(displayValue);

        if (operator && waitingForSecondOperand) {
            setOperator(nextOperator);
            return;
        }

        if (firstOperand === null) {
            setFirstOperand(inputValue);
        } else if (operator) {
            const result = calculate(firstOperand, inputValue, operator);
            const resultStr = String(parseFloat(result.toFixed(7)));
            setDisplayValue(resultStr);
            setFirstOperand(result);
        }

        setWaitingForSecondOperand(true);
        setOperator(nextOperator);
    };

    const calculate = (first: number, second: number, op: string): number => {
        switch (op) {
            case '+': return first + second;
            case '-': return first - second;
            case '×': return first * second;
            case '÷':
                if (second === 0) return NaN;
                return first / second;
            default: return second;
        }
    };

    const handleEquals = () => {
        if (operator && firstOperand !== null) {
            const inputValue = parseFloat(displayValue);
            const result = calculate(firstOperand, inputValue, operator);
            
            if (isNaN(result)) {
                setDisplayValue('Error');
            } else {
                const resultStr = String(parseFloat(result.toFixed(7)));
                setDisplayValue(resultStr);
            }

            setFirstOperand(null);
            setOperator(null);
            setWaitingForSecondOperand(true);
        }
    };

    const buttonClasses = "rounded-lg text-2xl font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors";
    const numButtonClasses = `${buttonClasses} bg-gray-700 hover:bg-gray-600 text-white focus:ring-indigo-500`;
    const opButtonClasses = `${buttonClasses} bg-indigo-600 hover:bg-indigo-500 text-white focus:ring-indigo-400`;
    const specialButtonClasses = `${buttonClasses} bg-gray-500 hover:bg-gray-400 text-white focus:ring-gray-400`;

    const renderButton = (label: string, onClick: () => void, className: string, span: string = 'col-span-1') => (
        <button onClick={onClick} className={`${className} ${span}`}>{label}</button>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
            <div className="bg-gray-900 rounded-2xl shadow-xl p-4 w-full max-w-xs border border-gray-700">
                <div className="relative mb-4">
                    <div className="bg-gray-800 rounded-lg p-4 text-right text-4xl font-mono text-white break-all h-20 flex items-center justify-end">
                        {displayValue}
                    </div>
                     <button onClick={onClose} className="absolute -top-2 -right-2 p-1 bg-gray-700 rounded-full hover:bg-red-500 text-white">
                        <Icon name="x-mark" className="w-5 h-5"/>
                    </button>
                </div>
                <div className="grid grid-cols-4 grid-rows-5 gap-2 h-80">
                    {renderButton('AC', clearAll, specialButtonClasses)}
                    {renderButton('C', clearLastChar, specialButtonClasses)}
                    {renderButton('%', () => {}, specialButtonClasses)}
                    {renderButton('÷', () => performOperation('÷'), opButtonClasses)}

                    {renderButton('7', () => inputDigit('7'), numButtonClasses)}
                    {renderButton('8', () => inputDigit('8'), numButtonClasses)}
                    {renderButton('9', () => inputDigit('9'), numButtonClasses)}
                    {renderButton('×', () => performOperation('×'), opButtonClasses)}
                    
                    {renderButton('4', () => inputDigit('4'), numButtonClasses)}
                    {renderButton('5', () => inputDigit('5'), numButtonClasses)}
                    {renderButton('6', () => inputDigit('6'), numButtonClasses)}
                    {renderButton('-', () => performOperation('-'), opButtonClasses)}

                    {renderButton('1', () => inputDigit('1'), numButtonClasses)}
                    {renderButton('2', () => inputDigit('2'), numButtonClasses)}
                    {renderButton('3', () => inputDigit('3'), numButtonClasses)}
                    {renderButton('+', () => performOperation('+'), opButtonClasses)}
                    
                    {renderButton('0', () => inputDigit('0'), numButtonClasses, 'col-span-2')}
                    {renderButton('.', inputDecimal, numButtonClasses)}
                    {renderButton('=', handleEquals, opButtonClasses)}
                </div>
            </div>
        </div>
    );
};

export default Calculator;
