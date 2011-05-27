(function() {
  describe("ConnecTag.matchers", function() {
    describe("ConnecTag.matchers.hash", function() {
      return it("should match patterns against given values or window.location.hash", function() {
        var patterns;
        patterns = ['^#yo$', '^#hey$'];
        expect(ConnecTag.matchers.hash(patterns, '#hey')).toEqual(true);
        expect(ConnecTag.matchers.hash(patterns, '#hello')).toEqual(false);
        window.location.hash = "hey";
        expect(ConnecTag.matchers.hash(patterns)).toEqual(true);
        window.location.hash = "bye";
        expect(ConnecTag.matchers.hash(patterns)).toEqual(false);
        return window.location.hash = "";
      });
    });
    describe("ConnecTag.matchers.pageId", function() {
      return it("should match patterns against given values or ConnecTag.values.pageId", function() {
        var patterns;
        patterns = ['^74$', '^1000$', '^homepage$'];
        expect(ConnecTag.matchers.pageId(patterns, "homepage")).toEqual(true);
        expect(ConnecTag.matchers.pageId(patterns, "hopage")).toEqual(false);
        expect(ConnecTag.matchers.pageId(patterns, ['ADLKJASD', '74'])).toEqual(true);
        ConnecTag.values.pageId = 1000;
        expect(ConnecTag.matchers.pageId(patterns)).toEqual(true);
        ConnecTag.values.pageId = 0;
        expect(ConnecTag.matchers.pageId(patterns)).toEqual(false);
        ConnecTag.values.pageId = [0, 2000, 'homepage'];
        return expect(ConnecTag.matchers.pageId(patterns)).toEqual(true);
      });
    });
    return describe("ConnecTag.matchers.event", function() {
      return it("should match patterns against given values", function() {
        var patterns;
        patterns = ['^someClickEvent$', '^anotherClick$'];
        expect(ConnecTag.matchers.event(patterns, 'someClickEvent')).toEqual(true);
        expect(ConnecTag.matchers.event(patterns, 'AGHSDLFKSJF')).toEqual(false);
        expect(ConnecTag.matchers.event(patterns, ['skfjs', 'lkajslkfjsf'])).toEqual(false);
        return expect(ConnecTag.matchers.event(patterns, ['anotherClick', 'AHWLKWJLKJSLKJSDF'])).toEqual(true);
      });
    });
  });
}).call(this);
