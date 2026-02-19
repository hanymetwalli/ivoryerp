<?php
/**
 * Minimalist XLSX Reader for Ivory HR
 * Reads basic spreadsheet data without external dependencies (Fallbacks to system tar if ZipArchive missing)
 */
class SimpleXLSXReader {
    public static function parse($filePath) {
        if (class_exists('ZipArchive')) {
            $zip = new ZipArchive;
            if ($zip->open($filePath) === TRUE) {
                return self::processZip($zip);
            }
        }
        
        // Fallback: use system tar (useful when php_zip is missing/disabled)
        return self::parseWithTar($filePath);
    }

    private static function processZip($zip) {
        $sharedStrings = [];
        $stringsXml = $zip->getFromName('xl/sharedStrings.xml');
        if ($stringsXml) {
            $xml = simplexml_load_string($stringsXml);
            if ($xml) {
                foreach ($xml->si as $si) {
                    $sharedStrings[] = (string)($si->t ?? $si->r->t ?? "");
                }
            }
        }

        $sheetXml = $zip->getFromName('xl/worksheets/sheet1.xml');
        if (!$sheetXml) return null;
        
        return self::parseSheetXml($sheetXml, $sharedStrings);
    }

    private static function parseWithTar($filePath) {
        $tempDir = sys_get_temp_dir() . '/xlsx_' . uniqid();
        if (!mkdir($tempDir, 0777, true)) return null;
        
        // Extract specific files using system tar
        // Redirect stderr to null to avoid noise
        $cmd = sprintf('tar -xf "%s" -C "%s" xl/sharedStrings.xml xl/worksheets/sheet1.xml 2>&1', $filePath, $tempDir);
        exec($cmd);
        
        $stringsXmlPath = $tempDir . '/xl/sharedStrings.xml';
        $sheetXmlPath = $tempDir . '/xl/worksheets/sheet1.xml';
        
        if (!file_exists($sheetXmlPath)) {
            self::rrmdir($tempDir);
            return null;
        }
        
        $sharedStrings = [];
        if (file_exists($stringsXmlPath)) {
            $xmlContent = file_get_contents($stringsXmlPath);
            if ($xmlContent) {
                $xml = simplexml_load_string($xmlContent);
                if ($xml) {
                    foreach ($xml->si as $si) {
                        $sharedStrings[] = (string)($si->t ?? $si->r->t ?? "");
                    }
                }
            }
        }

        $sheetContent = file_get_contents($sheetXmlPath);
        $rows = null;
        if ($sheetContent) {
            $rows = self::parseSheetXml($sheetContent, $sharedStrings);
        }
        
        self::rrmdir($tempDir);
        return $rows;
    }

    private static function parseSheetXml($xmlContent, $sharedStrings) {
        $xml = simplexml_load_string($xmlContent);
        if (!$xml) return null;

        $rows = [];
        foreach ($xml->sheetData->row as $row) {
            $rowData = [];
            foreach ($row->c as $cell) {
                $v = isset($cell->v) ? (string)$cell->v : "";
                $t = (string)$cell['t'];
                if ($t == 's' && $v !== "") { $v = $sharedStrings[$v] ?? ""; }
                
                // Get column index to handle empty cells
                $ref = (string)$cell['r'];
                if (preg_match('/([A-Z]+)(\d+)/', $ref, $matches)) {
                    $col = self::columnLetterToIndex($matches[1]);
                    $rowData[$col] = $v;
                }
            }
            // Fill gaps
            if (!empty($rowData)) {
                $maxCol = max(array_keys($rowData));
                for ($i = 0; $i <= $maxCol; $i++) {
                    if (!isset($rowData[$i])) $rowData[$i] = "";
                }
                ksort($rowData);
            }
            $rows[] = $rowData;
        }
        return $rows;
    }

    private static function columnLetterToIndex($letter) {
        $index = 0;
        for ($i = 0; $i < strlen($letter); $i++) {
            $index = $index * 26 + ord($letter[$i]) - 64;
        }
        return $index - 1;
    }

    private static function rrmdir($dir) {
        if (is_dir($dir)) {
            $objects = scandir($dir);
            foreach ($objects as $object) {
                if ($object != "." && $object != "..") {
                    if (is_dir($dir . "/" . $object) && !is_link($dir . "/" . $object))
                        self::rrmdir($dir . "/" . $object);
                    else
                        unlink($dir . "/" . $object);
                }
            }
            rmdir($dir);
        }
    }
}
