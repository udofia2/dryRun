const capitalizeFirstLetter = (string) => {
    const words = string.toLowerCase().split(" ");
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase() + words[0].slice(1);
    } else {
      const capitalizedWords = words.map((word) => {
        return word.charAt(0).toUpperCase() + word.slice(1);
      });
      return capitalizedWords.join(" ");
    }
  };

  export default capitalizeFirstLetter