<script>
  import { onMount } from "svelte";
  import { sysmessages } from '../store.js';
  import {
    getCurrentWeek,
    getDateOfISOWeek,
    makeCountry,
    makeDou
  } from "../util.js";
  import { Factory_Map } from "../consts.js";
  let filedialog;
  let filename = "";
  let messages = [];
  const unsubscribe = sysmessages.subscribe(value => {
		messages = value;
  });
  function openFileDialog() {
	filedialog.value = '';  
    filedialog.click();
  }
  function openfile(name) {
	const { app } = require("electron").remote;  
	const ospath = require("path");
    const outputDir = app.getPath("desktop");
    const path = ospath.resolve(outputDir, "Abson", name);
    const { shell } = require("electron");
    shell.openExternal(path);
  }
  onMount(() => {
    filedialog.onchange = e => {
      const items_map = {};
      const file = e.target.files[0];
      const { path, name } = file;
      const { app } = require("electron").remote;
      console.log("path", path, file);
      const fs = require("fs");
      const ospath = require("path");
      const PizZip = require("pizzip");
      const Excel = require("exceljs/modern.nodejs");
      const Docxtemplater = require("docxtemplater");
      const outputDir = app.getPath("desktop");
      filename = name;
      //Load the docx file as a binary
      var tempfilename = ospath.resolve(app.getAppPath(), "templatehardware.docx");
      var content = fs.readFileSync(tempfilename, "binary");

      var zip = new PizZip(content);

      var doc = new Docxtemplater();
      doc.setOptions({ linebreaks: true });
      doc.loadZip(zip);

      var workbook = new Excel.Workbook();
      sysmessages.addmsg({ name: "正在读取文件。。。", time: new Date() });
      workbook.xlsx.readFile(path).then(function() {
        var worksheet = workbook.getWorksheet("Disp w.34");
        if (!worksheet) {
		  alert("excel里面缺少页面 Disp w.34");
		  sysmessages.reset([
            { name: "excel里面缺少页面 Disp w.34", time: new Date() }
          ]);
          return;
        }
        sysmessages.addmsg({ name: "读取文件成功。", time: new Date() });
        worksheet.eachRow(function(row, rowNumber) {
          if (rowNumber > 2) {
            //const ddate = new Date(baseTime.getTime() + (row.getCell(17) - 1) * 24 * 3600 * 1000);
            const week = row.getCell(13);
            const currentWeek = getCurrentWeek();
            const currentYear = new Date().getFullYear();
            const weekYear = currentWeek > week ? currentYear + 1 : currentYear;
            const ddate = getDateOfISOWeek(week, weekYear);
            if (!row.getCell(2).text) return;
            const item = {
              ponum: row.getCell(2).text.substr(2),
              ponumstr: row.getCell(2).text,
              order: row.getCell(1).text,
              jworder: row.getCell(3).text,
              itemno: row.getCell(5).text,
              day: makeDou(ddate.getDate()),
              month: makeDou(ddate.getMonth() + 1),
              year: makeDou(ddate.getFullYear()),
              monthstr: ddate.toDateString().split(" ")[1],
              dest: row.getCell(4).text,
              destZh: makeCountry(
                row
                  .getCell(4)
                  .text.split(",")[1]
                  .replace(/ /g, "")
              ),
              description: row.getCell(6).text,
              amount: row.getCell(7).text,
              price: row.getCell(15).text,
              money: (row.getCell(7).text * row.getCell(15).text).toFixed(2),
              nowyear: makeDou(new Date().getFullYear()),
              nowmonth: makeDou(new Date().getMonth() + 1),
              nowday: makeDou(new Date().getDate())
            };
            if(!Factory_Map[item.itemno])return;
            item.during = Factory_Map[item.itemno][0];
            item.seller = Factory_Map[item.itemno][1];
            item.sellerzh = Factory_Map[item.itemno][2];
            item.address = Factory_Map[item.itemno][3];
            item.addresszh = Factory_Map[item.itemno][4];
            item.tel = Factory_Map[item.itemno][5];
            item.packing = Factory_Map[item.itemno][6];
            item.sellerAgency = Factory_Map[item.itemno][7]
              ? `\n${Factory_Map[item.itemno][7]}\n`
              : "";
            if (items_map[row.getCell(2).text]) {
              items_map[item.ponumstr].totalmoney += item.money * 1;
              items_map[item.ponumstr].clients.push(item);
            } else {
              items_map[item.ponumstr] = Object.assign({}, item);
              items_map[item.ponumstr].totalmoney = item.money * 1;
              items_map[item.ponumstr].clients = [item];
            }
          }
        });

        for (var key in items_map) {
          //set the templateVariables
          items_map[key].totalmoney = items_map[key].totalmoney.toFixed(2);
          doc.setData(items_map[key]);
          const filename = `${key}_${items_map[key].nowyear}_${items_map[key].nowmonth}_${items_map[key].nowday}.docx`;

          try {
            // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
            doc.render();
          } catch (error) {
            var e = {
              message: error.message,
              name: error.name,
              stack: error.stack,
              properties: error.properties
            };
            console.log(
              JSON.stringify({
                error: e
              })
            );
            // The error thrown here contains additional information when logged with JSON.stringify (it contains a property object).
            throw error;
          }

          var buf = doc.getZip().generate({
            type: "nodebuffer"
          });

          const dir = ospath.resolve(outputDir, "Abson");
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
          }
          const outputFile = ospath.resolve(dir, filename);
          try {
            fs.writeFileSync(outputFile, buf);
            sysmessages.addmsg({
              name: `${filename} 已成功！`,
              time: new Date(),
              kind: "filesuc",
              filename
            });
          } catch (e) {
            sysmessages.addmsg({
              name: `${filename} 文件已打开,生成失败`,
              time: new Date()
            });
          }

          //alert('完成')
        }
		sysmessages.addmsg({ name: `全部结束`, time: new Date() });
		sysmessages.addmsg({ name: `--------------------------------分割綫`, time: '分割綫--------------------------------' });
      });
    };
  });
</script>

<style>
  input {
    display: none;
  }
  .msg {
    overflow: auto;
    width: 100%;
  }
  .filesuc {
	border: 1px solid darkcyan;
	cursor: pointer;
  }
  .filesuc:hover{
	  background-color: cornflowerblue;
  }
</style>

<svelte:head>
  <title>Daisy’s hardware order generate</title>
</svelte:head>

<button on:click={openFileDialog} class="pure-button pure-button-primary">
  import hardware excel file
</button>
<input
  bind:this={filedialog}
  type="file"
  accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" />
<span>{filename}</span>

<div class="msg">
  {#each messages as { name, time, kind, filename }, i}
    <div class={kind} on:dblclick={() => openfile(filename)}>{name}:{time}</div>
  {/each}
</div>
