module.exports = {
  ['utils::parseInt']: function(value){
    let parsed = parseInt(value);
    if (isNaN(parsed)) {
      throw new Error('\"'+value+'\" is not a valid number');
    }
    return parsed;
  },
};
