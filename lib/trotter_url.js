var Trotter = {};

Trotter.Url = function (url) {
    // BEGIN URL SPEC
    // Covers both RFC 2396 and 2732
    pattern = {};

    /*
      unwise      = "{" | "}" | "|" | "\" | "^" | "`"
    */
    pattern.unwise = "{}|\\^`";

    /*
      lowalpha = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" |
                 "j" | "k" | "l" | "m" | "n" | "o" | "p" | "q" | "r" |
                 "s" | "t" | "u" | "v" | "w" | "x" | "y" | "z"
      upalpha  = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" |
                 "J" | "K" | "L" | "M" | "N" | "O" | "P" | "Q" | "R" |
                 "S" | "T" | "U" | "V" | "W" | "X" | "Y" | "Z"
      digit    = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" |
                 "8" | "9"
    */
    pattern.lowalpha = "a-z";
    pattern.upalpha = "A-Z";
    pattern.digit = "\\d";

    /*
      alpha         = lowalpha | upalpha
      alphanum      = alpha | digit
    */
    pattern.alpha = pattern.lowalpha + pattern.upalpha;
    pattern.alphanum = pattern.alpha + pattern.digit;

    /*
      hex           = digit | "A" | "B" | "C" | "D" | "E" | "F" |
                              "a" | "b" | "c" | "d" | "e" | "f"
      escaped       = "%" hex hex
    */
    pattern.hex = pattern.digit + "a-fA-F";
    pattern.escaped = "%[" + pattern.hex + "]{2}";

    /*
      mark          = "-" | "_" | "." | "!" | "~" | "*" | "'" |
                      "(" | ")"
      unreserved    = alphanum | mark
      reserved      = ";" | "/" | "?" | ":" | "@" | "&" | "=" | "+" |
                      "$" | "," | 
                      "[" | "]"  // FROM 2732
      uric          = reserved | unreserved | escaped
    */
    pattern.mark = "-_.!~*'()";
    pattern.unreserved = pattern.alphanum + pattern.mark;
    pattern.reserved = ";/?:@&=+$,\\[\\]";
    pattern.uric = "(?:[" + pattern.reserved + pattern.unreserved + 
                   "]|" + pattern.escaped + ")";

    /*
      query         = *uric
      fragment      = *uric
    */
    pattern.query = pattern.uric + "*";
    pattern.fragment = pattern.uric + "*";

    /*
      pchar         = unreserved | escaped |
                      ":" | "@" | "&" | "=" | "+" | "$" | ","
      param         = *pchar
      segment       = *pchar *( ";" param )
      path_segments = segment *( "/" segment )
      path          = [ abs_path | opaque_part ]
    */
    pattern.pchar = "(?:[" + pattern.unreserved + ":@&=+$,]|" + 
                    pattern.escaped + ")";
    pattern.param = pattern.pchar + "*";
    pattern.segment = pattern.param + "(?:;" + pattern.param + ")*";
    pattern.path_segments = pattern.segment + "(?:/" + pattern.segment + ")*";

    /*
      port          = *digit
      IPv4address = 1*3DIGIT "." 1*3DIGIT "." 1*3DIGIT "." 1*3DIGIT // FROM RFC 2373
    */    
    pattern.port = "[" + pattern.digit + "]*";
    pattern.ipv4address = "(?:[" + pattern.digit + "]{1,3}\\.){3}" + 
                          "[" + pattern.digit + "]{1,3}";

    /*
      hex4    = 1*4HEXDIG
      hexseq  = hex4 *( ":" hex4)
      hexpart = hexseq | hexseq "::" [ hexseq ] | "::" [ hexseq ]

      IPv6prefix  = hexpart "/" 1*2DIGIT
      IPv6address = hexpart [ ":" IPv4address ]

      ipv6reference = "[" IPv6address "]"
    */
    pattern.hex4 = "[" + pattern.hex + "]{1,4}";
    pattern.hexseq = pattern.hex4 + "(?::" + pattern.hex4 + ")*";
    pattern.hexpart = "(?:" + pattern.hexseq + ")?" +
                      "::" +
                      "(?:" + pattern.hexseq + ")?";
    pattern.ipv6prefix = pattern.hexpart + "/[" + pattern.digit + "]{1,2}";
    pattern.ipv6address = pattern.hexpart + "(?::" + pattern.ipv4address + ")?";
    pattern.ipv6reference = "\\[" + pattern.ipv6address + "\\]";

    /*
      toplabel      = alpha | alpha *( alphanum | "-" ) alphanum
      domainlabel   = alphanum | alphanum *( alphanum | "-" ) alphanum
      hostname      = *( domainlabel "." ) toplabel [ "." ]
      host          = hostname | IPv4address
      hostport      = host [ ":" port ]
    */
    pattern.toplabel = "(?:[" + pattern.alpha + "](?:[-" +
                       pattern.alphanum + "]*[" + pattern.alphanum + "])?)";
    pattern.domainlabel = "(?:[" + pattern.alphanum + "](?:[-" +
                       pattern.alphanum + "]*[" + pattern.alphanum + "])?)";
    pattern.hostname = "(?:" + pattern.domainlabel + "\\.)*" + pattern.toplabel +
                       "\\.?";
    pattern.host = "(?:" + pattern.hostname + "|" + pattern.ipv4address + 
                   "|" + pattern.ipv6address + ")";
    pattern.hostport = pattern.host + "(?::" + pattern.port + ")?";

    /*
      userinfo      = *( unreserved | escaped |
                         ";" | ":" | "&" | "=" | "+" | "$" | "," )
      server        = [ [ userinfo "@" ] hostport ]
    */
    pattern.userinfo = "(?:[" + pattern.unreserved + ";:&=+$,]|" + 
                       pattern.escaped + ")*";
    pattern.server = "(?:(?:" + pattern.userinfo + "@)?" + 
                     pattern.hostport + ")?";

    /*
      reg_name      = 1*( unreserved | escaped | "$" | "," |
                          ";" | ":" | "@" | "&" | "=" | "+" )
      authority     = server | reg_name
      scheme        = alpha *( alpha | digit | "+" | "-" | "." )
      rel_segment   = 1*( unreserved | escaped |
                          ";" | "@" | "&" | "=" | "+" | "$" | "," )
    */
    pattern.reg_name = "(?:[" + pattern.unreserved + "$,;:@&=+]|" + 
                       pattern.escaped + ")*";
    pattern.authority = "(?:" + pattern.server + "|" + pattern.reg_name + ")";
    pattern.scheme = "[" + pattern.alpha + "][" + pattern.alpha + pattern.digit + "+-.]*";
    pattern.rel_segment = "(?:[" + pattern.unreserved + ";@&=+$,]|" + 
                          pattern.escaped + ")+";

    /*
      abs_path      = "/"  path_segments
      rel_path      = rel_segment [ abs_path ]
      net_path      = "//" authority [ abs_path ]
    */
    pattern.abs_path = "/" + pattern.path_segments;
    pattern.rel_path = pattern.rel_segment + "(?:" + pattern.abs_path + ")?";
    pattern.net_path = "//" + pattern.authority + "(?:" + pattern.abs_path + ")?";

    /*
      uric_no_slash = unreserved | escaped | ";" | "?" | ":" | "@" |
                      "&" | "=" | "+" | "$" | ","
      opaque_part   = uric_no_slash *uric
      hier_part     = ( net_path | abs_path ) [ "?" query ]
    */
    pattern.uric_no_slash = "(?:[" + pattern.unreserved + ";?:@&=+$,]|" + 
                            pattern.escaped + ")";
    pattern.opaque_part = pattern.uric_no_slash + pattern.uric + "*";
    pattern.hier_part = "(?:" + pattern.net_path + "|" + pattern.abs_path + ")(?:" +
                        pattern.query + ")?";
    
    /*
      relativeURI   = ( net_path | abs_path | rel_path ) [ "?" query ]
      absoluteURI   = scheme ":" ( hier_part | opaque_part )
      URI-reference = [ absoluteURI | relativeURI ] [ "#" fragment ]
      path          = [ abs_path | opaque_part ]
      
    */
    pattern.path = pattern.abs_path + pattern.opaque_part;
    pattern.relativeURI = "(?:" + pattern.net_path + "|" + pattern.abs_path +
                          "|" + pattern.rel_path + ")(?:" + pattern.query + ")?";
    pattern.absoluteURI = pattern.scheme + ":(?:" + pattern.hier_part + "|" +
                          pattern.opaque_part + ")";
    pattern.URIreference = "(?:" + pattern.absoluteURI + "|" + pattern.relativeURI +
                           ")?(?:#" + pattern.fragment + ")?";
    // END URL SPEC

    pattern.splitAbsolute = 
      "(" + pattern.scheme + "):" +
      "(?:" +
        "(" + pattern.opaque_part + ")" +
      "|" +
        "(?:(?:" +
          "//(?:" +
              "(?:(?:(" + pattern.userinfo + ")@)?" +
                "(?:(" + pattern.host + ")(?::(\\d*))?))?" +
            "|" +
              "(" + pattern.reg_name + ")" +
            ")" +
          "|" +
          "(?!//))" +
          "(" + pattern.abs_path + ")?" +
        ")(?:\\?(" + pattern.query + "))?" +
      ")" +
      "(?:\\#(" + pattern.fragment + "))?";
            
    pattern.splitRelative =
      "(?:" +
        "(?:" +
          "//" +
          "(?:" +
            "(?:(" + pattern.userinfo + ")@)?" +
              "(" + pattern.host + ")?(?::(\\d*))?" +
          "|" +
            "(" + pattern.reg_name + ")" +
          ")" +
        ")" +
      "|" +
        "(" + pattern.rel_segment + ")" +
      ")?" +
      "(" + pattern.abs_path + ")?" +
      "(?:\\?(" + pattern.query + "))?" +
      "(?:\\#(" + pattern.fragment + "))?";

    split = url.replace(RegExp(pattern.splitAbsolute), "$1 $2 $3 $4 $5 $6 $7 $8 $9").split(" ");

    this.toString = function () { return url; };
    this.scheme = split[0]; 
    this.opaquePart = split[1];
    this.userInfo = split[2];
    this.host = split[3];
    this.port = split[4];
    this.regName = split[5];
    this.path = split[6];
    this.queryString = split[7];
    this.fragment = split[8];
};

