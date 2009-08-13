var ksPreference = {
    initFileKey: "extensions.keysnail.userscript.location",
    editorKey: "extensions.keysnail.userscript.editor",

    onLoad: function () {
        if (!this.modules.util.getUnicharPref(this.editorKey)) {
            if (this.modules.util.getUnicharPref("greasemonkey.editor")) {
                this.modules.userscript.syncEditorWithGM();
            }
        }
        this.updateAllFileFields();
    },

    updateFileField: function (aPrefKey, aID) {
        var location = this.modules.util.getUnicharPref(aPrefKey);
        var fileField = document.getElementById(aID);

        var file = this.openFile(location);

        if (file) {
            fileField.file = file;
            fileField.label = file.path;
        } else {
            fileField.file = null;
            fileField.label = "No path specified";
        }
    },

    updateAllFileFields: function () {
        this.updateFileField(this.initFileKey, "keysnail.preference.userscript.location");
        this.updateFileField(this.editorKey, "keysnail.preference.userscript.editor");
    },

    openFile: function (aPath) {
        var file = Components.classes["@mozilla.org/file/local;1"]
            .createInstance();
        var localFile = file
            .QueryInterface(Components.interfaces.nsILocalFile);

        try {
            localFile.initWithPath(aPath);
        } catch (e) {
            return null;
        }

        return localFile;
    },

    changePathClicked: function (aType) {
        var nsIFilePicker = Components.interfaces.nsIFilePicker;
        var fp = Components.classes["@mozilla.org/filepicker;1"]
            .createInstance(nsIFilePicker);
        var response;
        var prefKey;

        switch (aType) {
        case 'INITFILE':
            var initFileLocation = nsPreferences
                .getLocalizedUnicharPref(this.initFileKey)
                || nsPreferences
                .copyUnicharPref(this.initFileKey);

            fp.init(window, "Select a directory", nsIFilePicker.modeGetFolder);
            fp.displayDirectory = this.openFile(initFileLocation);
            prefKey = this.initFileKey;
            break;
        case 'EDITOR':
            fp.init(window, "Select Editor", nsIFilePicker.modeOpen);
            fp.appendFilters(Components.interfaces.nsIFilePicker.filterApps);
            prefKey = this.editorKey;
            break;
        }

        response = fp.show();
        if (response == nsIFilePicker.returnOK) {
            if (aType == 'INITFILE') {
                if (!this.modules.util.isDirHasFiles(fp.file.path,
                                                     this.modules.userscript.directoryDelimiter,
                                                     this.modules.userscript.defaultInitFileNames)) {
                    // directory has no rc file.
                    this.modules.util.alert(window, "keysnail:dialog",
                                            this.modules.util.getLocaleString("selectDirectoryContainsInitFile",
                                                                              [fp.file.path]));
                    return;
                }
            }

            nsPreferences.setUnicharPref(prefKey, fp.file.path);

            if (aType == 'INITFILE') {
                this.updateFileField(this.initFileKey, "keysnail.preference.userscript.location");                
            } else {
                this.updateFileField(this.editorKey, "keysnail.preference.userscript.editor");                
            }
        }
    }
};

(function () {
     var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
         .getService(Components.interfaces.nsIWindowMediator);
     var browserWindow = wm.getMostRecentWindow("navigator:browser");
     ksPreference.modules = browserWindow.KeySnail.modules;
 })();
