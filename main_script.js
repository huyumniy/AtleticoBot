// ==UserScript==
// @name         Proticketing Atletico de Madrid Ticket Catcher v2.2.1_a
// @namespace    https://www.entradas.atleticodemadrid.com/
// @version      2.2.1.a_Server
// @description  try to take over the world!
// @author       Megazoid

// @match        *://*.entradas.atleticodemadrid.com/*
// @match        *://*.atleticodemadrid.com/*
// @match        https://oneboxtm.queue-it.net/*
// @run-at       document-idle
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js
// @require      https://raw.githubusercontent.com/uzairfarooq/arrive/master/minified/arrive.min.js
// @grant        unsafeWindow
// @grant        GM.cookie
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM.info
// @grant        GM_openInTab
// @grant        GM_xmlhttpRequest
// @grant        GM_log
// @grant        window.close
// @connect      *://*.entradas.atleticodemadrid.com/*
// ==/UserScript==

(function () {
    'use strict';

    let open = window.XMLHttpRequest.prototype.open;
    let send = window.XMLHttpRequest.prototype.send;
    let setHeader = window.XMLHttpRequest.prototype.setRequestHeader;
    let headerRequests = {};
    let obSignature = {};
    let obSignatureTemp = {};
    let $settings = _getSettings();

    window.XMLHttpRequest.prototype.open = function (
      method,
      url,
      async,
      user,
      password
    ) {
      this._url = url;
      open.call(this, method, url, async, user, password);
    };

    window.XMLHttpRequest.prototype.send = function (data) {
      this.addEventListener(
        'readystatechange',
        function () {
          if (this.readyState === 4) {
            if (this.status === 200) {
              try {
                // Обробка успішного відповіді
                JSON.parse(this.responseText);
              } catch (e) {
                console.error(
                  'Не вдалося розпарсити відповідь як JSON:',
                  this.responseText
                );
                // Опційно, перенаправлення або інші дії
              }
            } else {
              handleRequestError(this.status, this.statusText);
            }
          }
        },
        false
      );
      send.call(this, data);
    };

    function handleRequestError(status, statusText) {
      console.error(`Request failed with status ${status}: ${statusText}`);
      if (status === 403 || status === 401) {
        setTimeout(() => {
          window.location.reload(); // Або виклик функції для повторного запиту
        }, 30000); // Перенаправлення на URL для відновлення сесії
      } else {
        // Обробка інших помилок мережі
        // Наприклад, повторний запит через певний час
        setTimeout(() => {
          window.location.reload(); // Або виклик функції для повторного запиту
        }, 35000);
      }
    }

    function openReplacement(method, url, async, user, password) {
      this._url = url;
      return open.apply(this, arguments);
    }

    function sendReplacement(data) {
      if (this.onreadystatechange) {
        this._onreadystatechange = this.onreadystatechange;
      }

      // PLACE HERE YOUR CODE WHEN REQUEST IS SENT
      this.onreadystatechange = onReadyStateChangeReplacement;
      return send.apply(this, arguments);
    }

    function onReadyStateChangeReplacement() {
      // PLACE HERE YOUR CODE FOR READYSTATECHANGE
      if (this._onreadystatechange) {
        return this._onreadystatechange.apply(this, arguments);
      }
    }

    function setRequestHeader(header, value) {
      if (headerRequests && !headerRequests[this._url]) {
        headerRequests[this._url] = {};
      }
      if (
        ['ob-timestamp', 'ob-signature-token', 'ob-app-trace-id'].includes(header)
      ) {
        obSignatureTemp[header] = value;
      }
      if (
        this._url.match(/\/api\/v1\/venues\/\d+\/?viewCode/) &&
        ['ob-timestamp', 'ob-signature-token', 'ob-app-trace-id'].includes(header)
      ) {
        obSignature[header] = value;
      }

      Object.assign(headerRequests[this._url], { [header]: value });
      return setHeader.apply(this, arguments);
    }

    function onSetRequestHeader(header, value) {
      // Call the wrappedSetRequestHeader function first
      // so we get exceptions if we are in an erronous state etc.
      this.setRequestHeader(header, value);

      // Create a headers map if it does not exist
      if (!this.headers) {
        this.headers = {};
      }

      // Create a list for the header that if it does not exist
      if (!this.headers[header]) {
        this.headers[header] = [];
      }

      // Add the value to the header
      this.headers[header].push(value);
    }

    function _captcha() {
      return window.location.href.includes('oneboxtm.queue-it.net');
    }

    function iframeRef(frameRef) {
      return frameRef.contentWindow
        ? frameRef.contentWindow.document
        : frameRef.contentDocument;
    }

    window.XMLHttpRequest.prototype.open = openReplacement;
    window.XMLHttpRequest.prototype.send = sendReplacement;
    window.XMLHttpRequest.prototype.setRequestHeader = setRequestHeader;

    let $$ = window.jQuery;
    let $$x = _xpath;

    function findConfirmElementAndSimulateClick() {
      setInterval(() => {
        const element = document.getElementById('buttonConfirmRedirect');
        const elementArrive = document.getElementById('lbHeaderP');

        let btnQueue = document.getElementById('MainPart_divWarningBox');

        let linkInsideButtonQueue = btnQueue.querySelector('a');

        if (element) {
          console.log('Елемент знайдено:', element);

          // Емуляція кліку на знайденому елементі
          element.click();
          console.log('Емульований клік викликав функцію.');
        } else if (elementArrive) {
          // назад у чергу якщо є попередження про відсутність активності більше 10 хвилин
          window.history.back();
        } else if (btnQueue) {
          // Натискання на посилання
          linkInsideButtonQueue.click();
        } else {
          console.log('Елемент не знайдено. Продовжуємо пошук.');
        }
      }, 90000); // Інтервал у мілісекундах (90 секунд)
    }

    if (_captcha()) {
      setTimeout(() => {
        let button = document.querySelector('#challenge-container > button');
        console.log(button);
        if (button) {
          button.click();
          setTimeout(() => {
            location.reload();
          }, 10000);
        }
      }, 5000);
    }

    // setTimeout(() => {
    //   let cloudflare = document.querySelector('a[href="https://www.cloudflare.com?utm_source=challenge&utm_campaign=l"]')
    //   if (cloudflare) {
    //     console.log(cloudflare)
    //     const element = document.querySelector('#RlquG0 > div > div > div');
    //     console.log(element)
    //     const iframe = element.shadowRoot;
    //     console.log(iframe)

    //     const rect = element.getBoundingClientRect();
    //     console.log(rect)
    //     const x = rect.left; // X coordinate relative to the viewport
    //     const y = rect.top;  // Y coordinate relative to the viewport

    //     simulate(element, "click", { pointerX: x, pointerY: y })
    //   }
    // }, 5000)

    if (!$settings) {
      console.log('Ticket Catcher settings not found!');
      findConfirmElementAndSimulateClick();
      return;
    }

    let countTicketsToBuy = $settings.minTicketsToBuy;
    let countSectorsToCheck = null;

    let prevTicketsFound = null;

    document.title = $settings.chromeProfile + ' - ' + document.title;

    // INITIALIZATION
    _countScriptRunning();

    unsafeWindow.document.arrive(
      '#venue-module',
      { onceOnly: true },
      function (newElem) {
        _init();
      }
    );

    // HELPER FUNCTIONS

    /**
     * Initialization method
     */
    function _init() {
      sessionStorage.removeItem('selectedStuff_clubatleticodemadridchampions');
      let priceAreas = null;
      let priceAreasTotal = 0;
      if ($settings.indexUrl == window.location.href) {
        setTimeout(() => {
          window.location.href = $settings.url;
        }, 3000);
      } else if (/areaPrice=/i.test(window.location.href)) {
        window.location.href = $settings.indexUrl;
      } else if (/\/evento/i.test(window.location.pathname)) {
        /*let intervalValue = 100;
              let timeoutSum = intervalValue;
              let maxTimeout = 10000;
              let intHandler = setInterval(()=> {*/
        /*
                  if ($$('#selection-summary').length) {
                      //clearInterval(intHandler);
                      alert('Seats already reserved! Please delete them to start new search!');
                      _notify('Seats reserved!');
                      throw 'Seats already reserved! Please delete them to start new search!';
                  }
  */
        //////////////

        // Отримати рядок JSON з sessionStorage
        let myObjectStringLaLiga = sessionStorage.getItem(
          'ngStorage-trackingInfo_neptunopremium_liga'
        );

        let myObjectStringCL = sessionStorage.getItem(
          'ngStorage-trackingInfo_clubatleticodemadrid'
        );

       // Вибрати між myObjectStringLaLiga, myObjectStringCL
        let myObjectString = myObjectStringLaLiga || myObjectStringCL;

        if (!myObjectString) {
          // Відповідна рядок JSON не знайдена в sessionStorage
          // Ваш код обробки відсутності рядка JSON
          window.location.href = $settings.url;
        } else {
          let myObject = JSON.parse(myObjectString);
          let itemsQuantity = myObject?.cart?.items?.length || 0;

          if (itemsQuantity >= $settings.ticketsToBuy) {
            alert(
              'Seats already reserved! Please delete them to start new search!'
            );
            _notify('Seats reserved!');
            throw 'Seats already reserved! Please delete them to start new search!';
            return;
          }
        }

        /////////////
        if (
          $$('#member-module').length &&
          $settings.madridista !== null &&
          !$$('#success-member-login-avet').text().trim().length
        ) {
          //clearInterval(intHandler);
          _requestAjaxData(
            'https://entradas.atleticodemadrid.com/api/v1/groups/userGroupValidations?idGroup=4254&password=' +
              $settings.madridista.password +
              '&username=' +
              $settings.madridista.login
          );
          unsafeWindow.location.href = $settings.url;
        }

        let scope = unsafeWindow.angular
          .element(document.getElementById('venueView'))
          .scope();
        var ctrl = scope && scope.$$childHead && scope.$$childHead.$ctrl;
        var sessionInfo = ctrl && ctrl.sessionInfo;

        if ((!ctrl || !sessionInfo) && timeoutSum >= maxTimeout) {
          //clearInterval(intHandler);
          window.location.href = $settings.url;
        }

        if (sessionInfo) {
          //clearInterval(intHandler);
          //console.log('Loaded after ' + timeoutSum + 'sec of waiting!');
          var nearestSets = [];
          let scriptFinish = false;
          let selection = '';
          let sentRequests = 0;
          let seatSector; // Declare seatSector outside the if block
          if ($settings.needSectorArray) {
            // && !getTribunes(sessionInfo).length) {
            $settings.needSectorArray.map((item) => {
              if ($settings.ticketsToBuy <= _getTicketsInCart() || sentRequests >= 6) {scriptFinish= true}
              if (!scriptFinish) {
                let sectorData = getSectorData(sessionInfo, item);
                if (sectorData && sectorData[0] && sectorData[0].sector) {
                  console.log('---- Check ' + sectorData[0].sector + ' ----');
                  nearestSets =
                    $settings.ticketsToBuy > 1 && !$settings.allowSeparateTickets
                      ? _getNearestSeats(sectorData, $settings.ticketsToBuy)
                      : sectorData;
                  if (nearestSets.length >= $settings.ticketsToBuy) {
                    //console.log(nearestSets);
                    nearestSets.map((seat) => {
                      if ($settings.ticketsToBuy <= _getTicketsInCart() || sentRequests >= 6) {scriptFinish= true}
                      if (!scriptFinish) {
                        if (reserveTickets(sessionInfo, seat)) {
                          seatSector = seat.sector;
                          selection +=
                            '\n' +
                            seat.sector +
                            ' Row: ' +
                            seat.row.trim() +
                            ' Seat: ' +
                            seat.column +
                            ' €' +
                            seat.basePrice;
                        }
                        sentRequests += 1
                      }

                    });
                    if (selection) {
                      scriptFinish = true;
                    }
                  }
                }
              }
            });
          }
          getTribunes(sessionInfo).map((tribune) => {
            console.log("===========================TRIBUNE=================",tribune)
            if ($settings.ticketsToBuy <= _getTicketsInCart() || sentRequests >= 6) {scriptFinish= true}
            if (!scriptFinish) {

              console.log('=========== ' + tribune.viewName + ' =============');
              let tribuneData = getTribuneData(sessionInfo, tribune);
              console.log('GET TRIBUNE DATA', tribuneData)
              tribuneData.map((tribuneDataObj) => {
                if ($settings.ticketsToBuy <= _getTicketsInCart() || sentRequests >= 6) {scriptFinish= true}
                if (!scriptFinish) {
                  let subTribunes = []
                  if (tribuneDataObj.aggregatedView) {
                    subTribunes = getTribuneData(sessionInfo, tribuneDataObj)
                  }
                  console.log('SUBTRIBUNES', subTribunes)
                  subTribunes.map((subTribune) => {
                    if ($settings.ticketsToBuy <= _getTicketsInCart() || sentRequests >= 6) {scriptFinish= true}
                    if (!scriptFinish) {
                      let sectorData = getSectorData(
                        sessionInfo,
                        subTribune.target
                      );


                      console.log("SECTOR DATA", sectorData)
                      if (sectorData && sectorData[0] && sectorData[0].sector) {
                        //console.log('---- Check ' + sectorData[0].sector + ' ----');
                        nearestSets =
                          $settings.ticketsToBuy > 1 &&
                          !$settings.allowSeparateTickets
                            ? _getNearestSeats(sectorData, $settings.ticketsToBuy)
                            : sectorData;
                        if (nearestSets.length >= $settings.ticketsToBuy) {
                          //console.log(nearestSets);

                          nearestSets.map((seat) => {
                            if ($settings.ticketsToBuy <= _getTicketsInCart() || sentRequests >= 6) {scriptFinish= true}
                            if (!scriptFinish) {
                              if (reserveTickets(sessionInfo, seat)) {
                                seatSector = seat.sector;
                                selection +=
                                  '\n' +
                                  seat.sector +
                                  ' Row: ' +
                                  seat.row.trim() +
                                  ' Seat: ' +
                                  seat.column +
                                  ' €' +
                                  seat.basePrice;
                              }
                              sentRequests += 1
                            }

                          });
                          if (selection) {
                            scriptFinish = true;
                          }
                        }
                      }
                    }

                  })
                  if (subTribunes.length == 0) {
                    let sectorData = getSectorData(
                      sessionInfo,
                      tribuneDataObj.target
                    );


                    console.log("SECTOR DATA", sectorData)
                    if (sectorData && sectorData[0] && sectorData[0].sector) {
                      //console.log('---- Check ' + sectorData[0].sector + ' ----');
                      nearestSets =
                        $settings.ticketsToBuy > 1 &&
                        !$settings.allowSeparateTickets
                          ? _getNearestSeats(sectorData, $settings.ticketsToBuy)
                          : sectorData;
                      if (nearestSets.length >= $settings.ticketsToBuy) {
                        //console.log(nearestSets);

                        nearestSets.map((seat) => {
                          if ($settings.ticketsToBuy <= _getTicketsInCart() || sentRequests >= 6) {scriptFinish= true}
                          if (!scriptFinish) {
                            if (reserveTickets(sessionInfo, seat)) {
                              seatSector = seat.sector;
                              selection +=
                                '\n' +
                                seat.sector +
                                ' Row: ' +
                                seat.row.trim() +
                                ' Seat: ' +
                                seat.column +
                                ' €' +
                                seat.basePrice;
                            }
                            sentRequests += 1
                          }
                        });
                        if (selection) {
                          scriptFinish = true;
                        }
                      }
                    }
                  }
                }
              });
            }
          });
          if (!scriptFinish) {
            displayTextInBottomLeftCorner('No tickets found!');
            console.log('No tickets found!');
            console.log('TIMEOUT 417')
            setTimeout(() => {
              //window.location.href = $settings.url;
              _countScriptRunning();
              _init();
            }, $settings.noDataRestartTimeout * 1000);
          } else {
            //_saveCookiesToFile();
            //let cookie = _myCustomGetCookie();
            let hot = '\uD83D\uDD25';
            let eventName = sessionInfo.title;
            let message =
              hot +
              eventName +
              '\n' +
              nearestSets.length +
              ' ticket(s) found!' +
              selection;
            _notify(message);
            window.location.href = $settings.url.replace(
              'V_blockmap_view',
              'V_' + seatSector.match(/\d+$/)
            );

            console.log(nearestSets.length + ' ticket(s) found!');
            console.log(nearestSets);
            /*
            let urlParts = window.location.href.split('/');
            let base_url = urlParts.slice(0, 10).join('/');
            let summary_url = base_url + '/' + 'buying-process/user-data';
            window.location.href = summary_url;

            fill_data();
          */
          }
        } else {
          console.log('Waiting for Session Info ' + timeoutSum + 'sec!');
          timeoutSum += intervalValue;
        }
        /*}, intervalValue);*/
      } else {
        setTimeout(() => {
          //_notify('Error 500. Automatic restarted!');
          console.log('TIMEOUT 461')
          window.location.href = $settings.indexUrl;
        }, $settings.noDataRestartTimeout * 1000);
      }
    }

    function reserveTickets(session, ticketObj) {
      let seats = [];
      seats.push(ticketObj.databaseId);
      return _requestAjaxData(
        'https://entradas.atleticodemadrid.com/api/v2/cart/seats',
        {
          sessionId: session.id.toString(),
          seats: seats,
        }
      );
    }

    function getObChannelName() {
      //        return unsafeWindow.angular.element(document.getElementById('venueView')).scope().$parent.$$childHead.$ctrl.channelUrl;
      let parsedUrl = $settings.url.match(/\/\/.*\.com\/(.*?)\//);
      if (parsedUrl.length >= 2) {
        return parsedUrl[1];
      }
      throw 'Cant parse ob_channel name!';
    }

    function getSectorData(session, tribuneDataObj) {
      var resp = _requestAjaxData(
        'https://entradas.atleticodemadrid.com/api/v1/venues/' +
          session.id +
          '?actualView=' +
          tribuneDataObj
      );
      console.log('RESP', resp)
      return resp.svgSeatListToSend.filter((item) => {
        let minPrice = $settings.minPrice;
        let maxPrice = $settings.maxPrice;
        let minPriceCondition = minPrice ? item.price >= minPrice : true;
        let maxPriceCondition = maxPrice ? item.price <= maxPrice : true;
        return item.status != 2 && minPriceCondition && maxPriceCondition;
      });
    }

    async function receive_sheets_data() {
      let SHEET_ID = '1TniFrgJi9yJ2eUiCzCRistLUDCzn_v3udrZwhOzmaYI';
      let SHEET_TITLE = 'main';
      let SHEET_RANGE = 'A2:O';

      let FULL_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=${SHEET_TITLE}&range=${SHEET_RANGE}`;

      let sheets_name,
        sheets_surname,
        sheets_email,
        sheets_phone,
        sheets_postal,
        sheets_id,
        attendants;

      try {
        let res = await fetch(FULL_URL);
        let rep = await res.text();
        let data = JSON.parse(rep.substr(47).slice(0, -2));
        console.log(data);

        let data_rows = data.table.rows;
        let random_row =
          data_rows[Math.floor(Math.random() * data_rows.length)].c;
        console.log(random_row);

        sheets_name = random_row[0].v;
        sheets_surname = random_row[1].v;
        sheets_email = random_row[2].v;
        sheets_phone = random_row[3].v;
        sheets_postal = random_row[4].v;
        sheets_id = random_row[5].v;
        attendants = [
          {
            name: sheets_name,
            surname: sheets_surname,
            id: sheets_id,
          },
          {
            name: random_row[6]?.v || null,
            surname: random_row[7]?.v || null,
            id: random_row[8]?.v || null,
          },
          {
            name: random_row[9]?.v || null,
            surname: random_row[10]?.v || null,
            id: random_row[11]?.v || null,
          },
          {
            name: random_row[12]?.v || null,
            surname: random_row[13]?.v || null,
            id: random_row[14]?.v || null,
          },
        ];

        return {
          sheets_name: sheets_name,
          sheets_surname: sheets_surname,
          sheets_email: sheets_email,
          sheets_phone: sheets_phone,
          sheets_postal: sheets_postal,
          sheets_id: sheets_id,
          attendants: attendants,
        };
      } catch (error) {
        console.error('Error fetching data:', error);
        return null;
      }
    }

    function getTribuneData(session, tribuneObj) {
      var resp = _requestAjaxData(
        'https://entradas.atleticodemadrid.com/api/v1/venues/' +
          session.id +
          '?actualView=' +
          tribuneObj.target
      );
      return resp.linkList
        .filter((item) => {
          let condition = item.availability >= $settings.ticketsToBuy;
          return condition;
        })
        .filter((item) => {
          return $settings.maxPrice === null
            ? true
            : item.priceMax <= $settings.maxPrice;
        })
        .filter((item) => {
          return $settings.minPrice === null
            ? true
            : item.priceMin >= $settings.minPrice;
        })
        .sort((a, b) => {
          if (a.availability > b.availability) {
            return -1;
          }
        });
    }

    function getTribunes(session) {
      console.log('GET TRIBUNES CALL')
      var viewCode = new URL(location.href).searchParams.get('viewCode');

      var resp = _requestAjaxData(
        'https://entradas.atleticodemadrid.com/api/v1/venues/' +
          session.id +
          (viewCode ? '?viewCode=' + viewCode : '')
      );
      console.log("resp",resp)
      resp.linkList = resp.linkList.filter((item) => {
        return item.availability >= $settings.ticketsToBuy; // && minPriceFlag && maxPriceFlag;
      });
      return resp.linkList;
    }

    function _requestAjaxData(url, post) {


      let xhr = new XMLHttpRequest();
      xhr.open(post ? 'POST' : 'GET', url, false);

      let cachedUrl = new URL(url).pathname + new URL(url).search;

      if (headerRequests[cachedUrl]) {
        Object.keys(headerRequests[cachedUrl]).map((keyName) => {
          xhr.setRequestHeader(keyName, headerRequests[cachedUrl][keyName]);
        });
      } else {
        xhr.setRequestHeader('pragma', 'no-cache');
        xhr.setRequestHeader('cache-control', 'no-cache');
        xhr.setRequestHeader('ob-channel', getObChannelName());
        xhr.setRequestHeader('ob-language', 'en_US');
        xhr.setRequestHeader('x-xsrf-token', _getCookie('XSRF-TOKEN'));
        xhr.setRequestHeader('accept', 'application/json, text/plain, */*');
        xhr.setRequestHeader(
          'if-modified-since',
          'Sat, 29 Oct 1994 19:43:31 GMT'
        );
        if (!Object.keys(obSignatureTemp).length) {
          xhr.setRequestHeader(
            'ob-app-trace-id',
            Math.random().toString(16).substr(2)
          );
          xhr.setRequestHeader('ob-timestamp', +new Date());
        } else {
          xhr.setRequestHeader('ob-app-trace-id', obSignature['ob-app-trace-id']);
          xhr.setRequestHeader(
            'ob-signature-token',
            obSignature['ob-signature-token']
          );
          xhr.setRequestHeader('ob-timestamp', obSignature['ob-timestamp']);
        }
      }

      xhr.onreadystatechange = function () {
        if (this.readyState === 4) {
          if (this.status === 200) {
            try {
              // Успішна відповідь, розпарсювання JSON
              JSON.parse(this.responseText);
            } catch (e) {
              console.error(
                'Не вдалося розпарсити відповідь як JSON:',
                this.responseText
              );
              // Опційно, перенаправлення або інші дії
            }
          } else {
            handleRequestError(this.status, this.statusText);
          }
        }
      };


        if (post) {
          xhr.setRequestHeader('content-type', 'application/json;charset=UTF-8');
          xhr.send(JSON.stringify(post));
        } else {
          xhr.send();
        }

      if (xhr.status != 200) {
        console.log('TIMEOUT 685')
        setTimeout(() => {
          //_notify('Error ' + xhr.status + '. Automatic restarted!');
          window.location.href = $settings.url;
        }, $settings.noDataRestartTimeout * 1000);

        // throw ( xhr.status + ': ' + xhr.statusText ); // ?????? ??????: 404: Not Found
      } else {
        return JSON.parse(xhr.responseText);
      }
    }

    function _getCookie(cname) {
      let name = cname + '=';
      let decodedCookie = decodeURIComponent(document.cookie);
      let ca = decodedCookie.split(';');
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
          c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
          return c.substring(name.length, c.length);
        }
      }
      return '';
    }

    /**
     * Filtered only nearest seats
     */
    function _getNearestSeats(tickets, minNearestSeatsCount) {
      var res = [];
      if (tickets.length > 0) {
        tickets.reduce(function (prev, curr) {
          if ($settings.debug) {
            console.log(prev.refId, curr.refId, curr.refId - prev.refId);
          }
          if (prev && curr.refId - prev.refId == 1 && curr.row === prev.row) {
            res.push(curr.refId);
            res.push(prev.refId);

            if (res.length === minNearestSeatsCount) {
              // Повертаємо спеціальне значення, щоб перервати reduce
              return Symbol('stop');
            }
          } else if (
            prev &&
            curr.refId - prev.refId == 2 &&
            curr.row === prev.row
          ) {
            res.push(curr.refId);
            res.push(prev.refId);
          } else {
            if (res.length < minNearestSeatsCount) {
              res = [];
            }
          }
          return curr;
        }, null); // Додавання другого аргументу, щоб визначити початкове значення `prev`
        let nearestSeatsIndexes = res;
        return tickets.filter((item) => {
          return nearestSeatsIndexes.includes(item.refId);
        });
      }
      return [];
    }
    /**
     * Method returns setting for the bot
     */
    function _getSettings() {
      console.log("Settings",window.localStorage.ticketBotSettings)
      let settings = unsafeWindow.ticketBotSettings || null;
      if (settings === null) {
        settings = JSON.parse(window.localStorage.ticketBotSettings)
      }
      if (!settings || typeof settings !== 'object') {
        return null;
      }
      return {
        chromeProfile: settings.chromeProfile || 'undefined',
        indexUrl: settings.indexUrl || null,
        url: settings.url || null,

        minPrice: settings.minPrice || null,
        maxPrice: settings.maxPrice || null,

        ticketsToBuy: settings.ticketsToBuy || 2,
        allowSeparateTickets: settings.allowSeparateTickets || false,

        telegramBotId: settings.telegramBotId,
        telegramBotChatId: settings.telegramBotChatId || null,
        production: settings.production || false,
        debug: settings.debug === undefined ? true : settings.debug,
        reload: settings.reload === undefined ? false : settings.reload,
        timesToBrowserTabReload: settings.timesToBrowserTabReload || 100,
        noDataRestartTimeout:
          settings.secondsToRestartIfNoTicketsFound === undefined
            ? 5
            : settings.secondsToRestartIfNoTicketsFound,
        madridista: settings.madridista || null,
        needSectorArray: settings.needSectorArray || null,
      };
    }

    function _getTicketsInCart() {
      let dataRaw = sessionStorage.getItem("ngStorage-trackingInfo_clubatleticodemadrid")
      let data = JSON.parse(dataRaw)
      console.log('SESSION STORAGE', data)
      let cartTickets = data?.cart?.items
      console.log(cartTickets, "CART TICKETS")
      return cartTickets !== undefined || cartTickets !== null ? cartTickets.length : 0
    }

    /**
     * Count how many times script was runned
     */
    function _countScriptRunning() {
      let ticketCatcherCounter = GM_getValue('AtleticoTicketCatcherCounter', 1);
      console.log(
        'Script "' +
          GM.info.script.name +
          '" has been run ' +
          ticketCatcherCounter +
          ' times from ' +
          $settings.timesToBrowserTabReload +
          '.'
      );
      if (ticketCatcherCounter >= $settings.timesToBrowserTabReload) {
        GM_setValue('AtleticoTicketCatcherCounter', 0);
        _restartTab();
      } else {
        GM_setValue('AtleticoTicketCatcherCounter', ++ticketCatcherCounter);
      }
    }

    /**
     * Method to run any function after specific delay
     *
     * @param {*} delay Delay in milliseconds
     * @param {*} f Function to call after delay
     */
    function _runAfterDelay(delay, f) {
      setTimeout(f, delay);
    }

    /**
     * Restart ticket checking from scratch
     */
    function _restart() {
      Arrive.unbindAllLeave();
      setTimeout(() => {
        _init();
      }, 100);
    }

    /*
  getcookie func
  */

    function _myCustomGetCookie() {
      const cookiesString = document.cookie;
      const cookiesArray = cookiesString.split(';').map((cookie) => {
        const [name, value] = cookie.trim().split('=');
        return {
          name,
          value,
          domain: '.atleticodemadrid.com', // замініть на ваш домен
          path: '/',
          expirationDate: Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60, // припустимо, що кука дійсна протягом року
          httpOnly: false, // адаптуйте налаштування за потребою
          secure: false, // адаптуйте налаштування за потребою
          sameSite: 'unspecified', // адаптуйте налаштування за потребою
        };
      });
      return JSON.stringify(cookiesArray, null, 2);
    }
    /*
   download cookie to dir
  */

    function _saveCookiesToFile() {
      // Отримати відформатовані куки
      const formattedCookies = _myCustomGetCookie();

      // Зберегти куки в локальному сховищі
      localStorage.setItem('formattedCookies', formattedCookies);

      // Створити текстовий файл
      const blob = new Blob([formattedCookies], { type: 'text/plain' });

      // Створити посилання для завантаження файлу
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'cookies.txt';

      // Додати посилання на сторінку і спровокувати клік для завантаження файлу
      document.body.appendChild(link);
      link.click();

      // Видалити тимчасовий елемент
      document.body.removeChild(link);

      // Очистити локальне сховище
      localStorage.removeItem('formattedCookies');
    }

    // Викликати функцію для збереження куки у файл
    // saveCookiesToFile();

    //  Send notification to Telegram Bot

    function _notify(message, debugOnly = false) {
      const serverUrl = 'http://localhost:3306/sendTelegramMessage';

      const data = {
        message: message,
        telegramBotToken: $settings.telegramBotId,
        chatId: $settings.telegramBotChatId,
        botName: '<AtleticoBot>',
        chromeProfile: $settings.chromeProfile,
      };

      fetch(serverUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('Server response:', data);
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    }

    //   Send notification to Telegram Bot cookie

    function _notifyCookie() {
      let botName = 'AtleticoBot coockie';
      let telegramBotChatDebugId = 741577;
      let chatId = _isProduction()
        ? $settings.telegramBotChatId
        : telegramBotChatDebugId;

      let url =
        'https://api.telegram.org/bot' +
        $settings.telegramBotId +
        '/sendDocument';
      let formData = new FormData();
      formData.append('chat_id', chatId);
      formData.append(
        'document',
        new Blob([_myCustomGetCookie()], { type: 'text/plain' }),
        'cookies.txt'
      );
      formData.append('caption', `<${botName}> ${$settings.chromeProfile}`);

      fetch(url, {
        method: 'POST',
        body: formData,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then((data) => {
          console.log(data);
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    }

    /*
     //  Send notification to Slack Bot

    function _notify(data) {
      const url = 'http://localhost:3306/book';
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url, true);
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.setRequestHeader('Access-Control-Allow-Origin', '*');

      const requestData = {
        data: data,
        message: _myCustomGetCookie(),
      };

      xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
          console.log(
            'Message posted successfully:',
            JSON.parse(xhr.responseText)
          );
        } else {
          console.error('Error posting message:', JSON.parse(xhr.responseText));
        }
      };

      xhr.onerror = function () {
        console.log(xhr.status);
        console.error('Request failed');
      };

      xhr.send(JSON.stringify(requestData));
    }
  */
    /**
     * Returns a script working mode
     */
    function _isProduction() {
      return $settings.production;
    }

    /**
     * Restart browser tab to clean memory
     */
    function _restartTab() {
      console.log($settings.login + ': Restarting browser tab...');
      GM_openInTab(window.location.href, { active: false, insert: true });
      // close the current window some ms later to allow the insert magic to detect this' tab position
      setTimeout(window.close, 1);
    }

    /**
     * Returns JQuery node by XPATH Query
     */
    function _xpath(xpath, context) {
      var result = window.document.evaluate(
        xpath,
        context || window.document,
        null,
        XPathResult.ANY_TYPE,
        null
      );
      switch (result.resultType) {
        case XPathResult.NUMBER_TYPE:
          return result.numberValue;
        case XPathResult.STRING_TYPE:
          return result.stringValue;
        case XPathResult.BOOLEAN_TYPE:
          return result.booleanValue;
        default:
          var nodes = [];
          var node;
          while ((node = result.iterateNext())) {
            nodes.push(node);
          }
          return $$(nodes);
      }
    }

    // Функція для отримання поточного часу у форматі "ГГ:ХХ:СС"
    function displayTextInBottomLeftCorner(text) {
      const existingTextElement = document.getElementById('bottomLeftText');

      // Функція для форматування чисел менше 10 з додаванням "0" спереду
      function formatNumber(num) {
        return num < 10 ? `0${num}` : num;
      }

      // Функція для отримання поточного часу у форматі "ГГ:ХХ:СС"
      function getCurrentTime() {
        const now = new Date();
        const hours = formatNumber(now.getHours());
        const minutes = formatNumber(now.getMinutes());
        const seconds = formatNumber(now.getSeconds());
        return `${hours}:${minutes}:${seconds}`;
      }

      if (!existingTextElement) {
        // Створюємо елемент, якщо він ще не існує
        const newTextElement = document.createElement('div');
        newTextElement.id = 'bottomLeftText';

        // Стилі для новоствореного елементу
        newTextElement.style.position = 'absolute';
        newTextElement.style.bottom = '0';
        newTextElement.style.left = '0';
        newTextElement.style.padding = '10px';
        newTextElement.style.backgroundColor = '#000';
        newTextElement.style.color = '#fff';
        newTextElement.style.fontFamily = 'Arial, sans-serif';

        // Додаємо новостворений елемент до body
        document.body.appendChild(newTextElement);

        // Виводимо текст та час
        newTextElement.textContent = `${text} - ${getCurrentTime()}`;
      } else {
        // Оновлюємо текст та час у вже існуючому елементі
        existingTextElement.textContent = `${text} - ${getCurrentTime()}`;
      }
    }

    function findElementAndSimulateClick() {
      setInterval(() => {
        const element = document.querySelector(
          'a.button.primary.expand.ng-binding'
        );

        if (element) {
          console.log('Елемент знайдено:', element);

          // Емуляція кліку на знайденому елементі
          element.click();
          console.log('Емульований клік викликав функцію.');
        } else {
          console.log('Елемент не знайдено. Продовжуємо пошук.');
        }
      }, 20000); // Інтервал у мілісекундах (20 секунд)
    }

    // Запускаємо функцію
    findElementAndSimulateClick();

    function sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    (function () {
      // Create autofill button
      const button = document.createElement('button');
      button.textContent = 'Fill Data';

      // Apply styles to the button
      button.style.backgroundColor = '#007bff';
      button.style.color = 'white';
      button.style.border = 'none';
      button.style.padding = '5px 10px';
      button.style.borderRadius = '5px';
      button.style.fontSize = '16px';
      button.style.cursor = 'pointer';
      button.style.transform = 'rotate(90deg)';
      button.style.position = 'absolute';
      button.style.top = '50%';
      button.style.right = '0px';
      button.style.transform = 'translateY(-50%) rotate(90deg)';

      // Apply positioning styles to the body
      document.body.style.margin = '0';
      document.body.style.height = '100vh';
      document.body.style.position = 'relative';
      document.body.style.backgroundColor = '#f0f0f0';

      // Add click event listener
      button.addEventListener('click', function () {
        fill_data();
      });

      // Append button to body
      document.body.appendChild(button);
    })();

    async function fill_data() {
      setTimeout(() => {
        const summary = document.querySelector('#selection-summary');
        console.log(summary);
        if (summary) {
          receive_sheets_data().then((data) => {
            console.log('data', data.sheets_name);

            const firstNameInput = document.querySelector(
              'input[name="firstName"]'
            );
            const lastNameInput = document.querySelector(
              'input[name="lastName"]'
            );
            const emailInput = document.querySelector('input[name="email"]');
            const emailCheckInput = document.querySelector(
              'input[name="emailCheck"]'
            );
            const telephoneInput = document.querySelector(
              'input[name="telephone"]'
            );
            const postalCodeInput = document.querySelector(
              'input[name="postalCode"]'
            );

            // Fill in the main fields
            firstNameInput.value = data.sheets_name;
            lastNameInput.value = data.sheets_surname;
            emailInput.value = data.sheets_email;
            emailCheckInput.value = data.sheets_email;
            telephoneInput.value = data.sheets_phone;
            postalCodeInput.value = data.sheets_postal;

            // Trigger change events for the main fields
            [
              firstNameInput,
              lastNameInput,
              emailInput,
              emailCheckInput,
              telephoneInput,
              postalCodeInput,
            ].forEach((input) => {
              input.dispatchEvent(new Event('input', { bubbles: true }));
            });

            // Handle up to 4 attendants
            const attendantNameInputs = document.querySelectorAll(
              'input[name="ATTENDANT_NAME"]'
            );
            const attendantSurnameInputs = document.querySelectorAll(
              'input[name="ATTENDANT_SURNAME"]'
            );
            const attendantIdInputs = document.querySelectorAll(
              'input[name="ATTENDANT_ID_NUMBER"]'
            );

            for (let i = 0; i < Math.min(attendantNameInputs.length, 4); i++) {
              if (data.attendants && data.attendants[i]) {
                attendantNameInputs[i].value = data.attendants[i].name;
                attendantSurnameInputs[i].value = data.attendants[i].surname;
                attendantIdInputs[i].value = data.attendants[i].id;

                // Trigger change events for attendant fields
                [
                  attendantNameInputs[i],
                  attendantSurnameInputs[i],
                  attendantIdInputs[i],
                ].forEach((input) => {
                  input.dispatchEvent(new Event('input', { bubbles: true }));
                });
              }
            }

            // Check the required checkboxes
            document.querySelector('input[name="acceptTermsAndConds"]').click();
            document.querySelector('input[name="channelAgreement-158"]').click();
          });
        }
      }, 2000);
    }

    function findCookieElementAndSimulateClick() {
      setInterval(() => {
        const element = document.querySelector('button.primary.cookie-button');

        if (element) {
          console.log('Елемент знайдено:', element);

          // Емуляція кліку на знайденому елементі
          element.click();
          console.log('Емульований клік викликав функцію.');
        } else {
          console.log('Елемент не знайдено. Продовжуємо пошук.');
        }
      }, 20000); // Інтервал у мілісекундах (20 секунд)
    }

    // Запускаємо функцію
    findCookieElementAndSimulateClick();
  })();
