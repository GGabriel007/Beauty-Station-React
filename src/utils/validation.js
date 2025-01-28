export const validateCardNumber = (cardNumber) => {
    cardNumber = cardNumber.replace(/\D/g, '');

    let sum = 0;
    let shouldDouble = false; 

    for (let i = cardNumber.length - 1; i >= 0; i--) {
        let digit = parseInt(cardNumber[i]);

        if (shouldDouble) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }

        sum += digit;
        shouldDouble = !shouldDouble; 

    }

    return sum % 10 === 0; 

};


export const validateExpiryDate = (expiryDate) => {

    // Ensure the format is correct (MM/YY)
    const regex = /^(0[1-9]|1[0-2])\/\d{2}$/; 

    if (!regex.test(expiryDate)) {
        return "La fecha de caducidad debe estar en el formato MM/YY.";
    }

    // Extract the month and year 
    const [month, year] = expiryDate.split('/').map(Number);

    // Get the current date
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; 
    const currentYear = currentDate.getFullYear() % 100;


    // Check if the expiration date is in the past
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
        return "La fecha de caducidad ya ha pasado.";
    }

    return "";
};

export const validateCVV = (cvv) => { 

    
};