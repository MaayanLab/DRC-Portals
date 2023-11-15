export default function removePunctuation(inputString: string): string {
    // Define a regular expression pattern to match punctuation characters
    const punctuationPattern = /[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g;
    console.log(inputString)
    // Use the replace method to remove punctuation
    const resultString = inputString.replace(punctuationPattern, '');
  
    return resultString;
  }