// Class Validator
function Validator(name) {
  this.name = name;
}

Validator.prototype.errorMessage = 'The value is not correct.';

Validator.prototype.validate = function (value) { // Like pattern "Template method"
  var result = {passed: true, value: value};
  if (typeof this.isValid === 'function') {
    if (!this.isValid(value)) {
      result.passed = false;
      result.message = this.name + ': ' + this.errorMessage;
    }
  }
  return result;
};

// Class IsNotEmptyValidator inherits from Validator
function IsNotEmptyValidator () {

}
IsNotEmptyValidator.prototype = new Validator('IsNotEmptyValidator');
IsNotEmptyValidator.prototype.constructor = IsNotEmptyValidator;
IsNotEmptyValidator.prototype.errorMessage = 'The value must not be empty.';
IsNotEmptyValidator.prototype.isValid = function (value) {
  return value != null && value !== '';
};

// Class ClassValidator inherits from Validator
function ClassValidator(constructorFn) {
  this.constructorFn = constructorFn;
}
ClassValidator.prototype = new Validator('ClassValidator');
ClassValidator.prototype.constructor = ClassValidator;
ClassValidator.prototype.errorMessage = 'The value is of incorrect class.';
ClassValidator.prototype.isValid = function (value) {
  return value.constructor === this.constructorFn;
};

// Class CustomValidator inherits from Validator
function CustomValidator(name, message, validationFn) {
  if (name) {
    this.name = name;
  }
  if (message) {
    this.errorMessage = message;
  }
  if (typeof validationFn === 'function') {
    this.isValid = validationFn;
  }
}
CustomValidator.prototype = new Validator('CustomValidator');
CustomValidator.prototype.constructor = CustomValidator;
CustomValidator.prototype.errorMessage = "The value hasn't passed the custom validation.";

// Class CompositeValidator inherits from Validator
function CompositeValidator() { // Like pattern 'Composite'
  this.validationPipe = [];
}
CompositeValidator.prototype = new Validator('CompositeValidator');
CompositeValidator.prototype.constructor = CompositeValidator;
CompositeValidator.prototype.addValidator = function (validator) {
  if (validator && typeof validator.validate === 'function') {
    this.validationPipe.push(validator);
  } else {
    throw new Error('Add validator failed: must be an instance of Validator.');
  }
};
CompositeValidator.prototype.isValid = function (value) {
  var result = true;
  for (var i = 0; i < this.validationPipe.length && result; i++) {
    var validationStepResult = this.validationPipe[i].validate(value);
    if (!validationStepResult.passed) {
      result = false;
      this.errorMessage = "Validation step: " + validationStepResult.message;
    }
  }
  return result;
};

// Static fields - a set of predefined validators
Validator.notEmptyValidator = new IsNotEmptyValidator();
Validator.isArrayValidator = new ClassValidator(Array);
Validator.isDateValidator = new ClassValidator(Date);

var vc = new CompositeValidator();
vc.addValidator(Validator.notEmptyValidator);
vc.addValidator(Validator.isArrayValidator);
vc.addValidator(new CustomValidator('LengthValidator', 'An array has incorrect length. Must be 3.', v => v.length === 3));
var res = vc.validate();
var res2 = vc.validate({});
var res3 = vc.validate([1,2]);
var res4 = vc.validate([1,2,3]);