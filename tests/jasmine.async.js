// Constructor Function
// --------------------

function AsyncSpec(spec){
  this.spec = spec;
}

(function(){

// Public API
// ----------
AsyncSpec.prototype.beforeEach = function(block){
  this.spec.beforeEach(runAsync(block));
};

AsyncSpec.prototype.afterEach = function(block){
  this.spec.afterEach(runAsync(block));
};

AsyncSpec.prototype.it = function(description, block){
  // For some reason, `it` is not attached to the current
  // test suite, so it has to be called from the global
  // context.
  it(description, runAsync(block));
};

// Private Methods
// ---------------

function runAsync(block){
  return function(){
    var done = false;
    var complete = function(){ done = true; };

    runs(function(){
      block(complete);
    });

    waitsFor(function(){
      return done;
    });
  };
}

})();
