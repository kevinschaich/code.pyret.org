function makeShareAPI(pyretVersion) {

  function drawShareWidget(shareUrl) {
    var widget = $("<div>").append([
        redditWidget(shareUrl),
        googleWidget(shareUrl),
        facebookWidget(shareUrl)
      ]);
    return widget;
  }

  function redditWidget(shareUrl) {
    // NOTE(joe 19 May 2014):
    // Adapted from first button at http://www.reddit.com/buttons/
    var link = $("<a>");
    link
      .attr("href", "http://www.reddit.com/submit?url=" + encodeURIComponent(shareUrl))
      .attr("target", "_blank")
      .attr("alt", "Share on Reddit")
      .append($("<img>")
                .attr("src", "http://www.reddit.com/static/spreddit1.gif")
                .css("border", 0));
    return link;
  }

  function googleWidget(shareUrl) {
    var link = $("<a>");
    link
      .attr("href", "https://plus.google.com/share?url=" + encodeURIComponent(shareUrl))
      .attr("target", "_blank")
      .attr("alt", "Share on Google+")
      .append($("<img>")
                .attr({ "width": 14, "height": 14 })
                .attr("src", "https://www.gstatic.com/images/icons/gplus-64.png")
                .attr("alt", "Share on Google+"));
    return link;
  }

  function facebookWidget(shareUrl) {
    var link = $("<a>");
    link
      .attr("href", "https://facebook.com/sharer.php?u=" + encodeURIComponent(shareUrl))
      .attr("target", "_blank")
      .attr("alt", "Share on Facebook")
      .append($("<img>")
              .attr({ "width": 14, "height": 14 })
              .attr("src", "http://www.wescheme.org/images/icon_facebook.gif"));
    return link;
  }

  function makeHoverMenu(triggerElt, menuElt, onShow) {
    var divHover = false;
    var linkHover = false;
    function hovering() {
      return divHover || linkHover;
    }
    function closeIfNotHovering() {
      setTimeout(function() {
        console.log(divHover, linkHover);
        if(!hovering()) {
          menuElt.fadeOut(500);
        }
      }, 500);
    }
    function showIfStillHovering() {
      setTimeout(function() {
        if(linkHover) {
          menuElt.css({
            position: "fixed",
            top: triggerElt.offset().top + 20,
            left: triggerElt.offset().left,
            "z-index": 12000,
            "min-height": "300px"
          });
          $(document.body).append(menuElt);
          menuElt.fadeIn(250);
          onShow();
        }
      }, 100);
    }
    menuElt.hover(function() {
      divHover = true;
    }, function() {
      divHover = false;
      closeIfNotHovering();
    });
    triggerElt.click(function(e) {
      linkHover = true;
      showIfStillHovering();
    });
    triggerElt.hover(function(e) {
      linkHover = true;
    }, function() {
      linkHover = false;
      closeIfNotHovering();
    });
    return triggerElt;
  }

  function makeShareLink(originalFile) {
    var link = $("<div>").append($("<button class=blueButton>").text("Share..."));
    link.attr("title", "Create links to share with others, and see previous shared copies you've made.");
    link.tooltip({ position: { my: "right top", of: link } });
    var shareDiv = $("<div>").addClass("share");
    return makeHoverMenu(link, shareDiv,
      function() {
        showShares(shareDiv, originalFile);
      });
  }

  function showShares(container, originalFile) {
    container.empty();
    var shares = originalFile.getShares();
    container.text("Loading share info...");
    var displayDone = shares.then(function(sharedInstances) {
      container.empty();
      console.log(sharedInstances);
      var a = $("<a>").text("Share a new copy").attr("href", "javascript:void(0)");
      a.attr("title", "This will make a new copy of the file as you see it now, and create a link that you can share with others.  They will be able to see, run, and make their own copy of your program, but not edit the original.");
      a.tooltip({ position: { my: "right top", of: a } });
      a.click(function() {
        var copy = originalFile.makeShareCopy();
        a.text("Copying...").attr("href", null);
        copy.fail(function(err) {
          console.log("Couldn't make copy: ", err);
          showShares(container, originalFile);
        });
        var copied = copy.then(function(f) {
          container.empty();
          showShares(container, originalFile);
        });
        copied.fail(unexpectedError);
      });
      container.append(a);
      if(sharedInstances.length === 0) {
        var p = $("<p>").text("This file hasn't been shared before.");
        container.append(p);
      }
      else {
        var p = $("<p>").text("This file has been shared before:");
        container.append(p);
        console.log("shared: ", sharedInstances);
        sharedInstances.forEach(function(shareFile) {
          container.append(drawShareRow(shareFile));
        });
      }
    });
    displayDone.fail(function(err) {
      console.error("Failed to get shares: ", err);
    });
  }

  function drawShareRow(f) {
    var container = $("<div>");
    var localShareUrl = "/editor#share=" + f.getUniqueId();
    if(pyretVersion !== "") {
      localShareUrl += "&v=" + pyretVersion;
    }
    var shareUrl = window.location.origin + localShareUrl;
    container.append($("<span>").text(new Date(f.getModifiedTime())));
    container.append($("<a>").attr({
        "href": localShareUrl,
        "target": "_blank"
      }).text(f.getName()));
    container.append(drawShareWidget(shareUrl));
    return container;
  }

  return {
    drawShareWidget: drawShareWidget,
    makeShareLink: makeShareLink,
    makeHoverMenu: makeHoverMenu
  };

}
