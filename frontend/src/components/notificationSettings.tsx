import React, { useState } from "react";
import { useQuery } from "react-query";
import {
  fetchCoincheckStatus,
  fetchSettings,
  saveSettings,
  hundleLineNotificationTestButton,
  Setting,
} from "../feature/notificationSettings";
import { currencyPairs } from "../feature/enums";
import { settingsSchema } from "../feature/notificationSettingsSchema";
import {
  Container,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Box,
  Alert,
  SelectChangeEvent, // 追加
} from "@mui/material";

function NotificationSettings() {
  const [infomation, setInfomation] = useState("");
  const [displaySetting, setDisplaySetting] = useState<Setting>({
    id: null,
    virtualCurrencyType: "btc_jpy",
    targetPrice: 0,
    lineToken: "",
  });
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const {
    data: tickerData,
    error: tickerError,
    isLoading: tickerLoading,
  } = useQuery({
    queryKey: ["ticker", displaySetting.virtualCurrencyType],
    queryFn: () => fetchCoincheckStatus(displaySetting.virtualCurrencyType),
    keepPreviousData: true,
  });

  const { error: settingsError, isLoading: settingsLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: fetchSettings,
    onSuccess: (settings) => {
      if (settings) {
        setDisplaySetting(settings);
      }
    },
  });

  const handleTargetPriceChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setDisplaySetting((prevSetting) => ({
      ...prevSetting,
      targetPrice: parseInt(event.target.value, 10),
    }));
  };

  const handleVirtualCurrencyTypeChange = (
    event: SelectChangeEvent<string> // 型を変更
  ) => {
    setDisplaySetting((prevSetting) => ({
      ...prevSetting,
      virtualCurrencyType: event.target.value as string,
    }));
  };

  const handleLineTokenChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setDisplaySetting((prevSetting) => ({
      ...prevSetting,
      lineToken: event.target.value,
    }));
  };

  const handleSettingSaveButton = async () => {
    try {
      const validatedData = settingsSchema.parse(displaySetting);
      await saveSettings({ displaySetting: validatedData });
      setInfomation("設定が保存されました。");
    } catch (error: any) {
      const formattedErrors: Record<string, string> = {};
      error.errors.forEach((err: any) => {
        formattedErrors[err.path[0]] = err.message;
      });
      setValidationErrors(formattedErrors);
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        通知設定
      </Typography>
      {settingsLoading || tickerLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center">
          <CircularProgress />
        </Box>
      ) : (
        <>
          <FormControl fullWidth margin="normal">
            <InputLabel id="virtual-currency-type-label">指定通貨</InputLabel>
            <Select
              labelId="virtual-currency-type-label"
              value={displaySetting.virtualCurrencyType}
              onChange={handleVirtualCurrencyTypeChange}
            >
              {currencyPairs.map((pair) => (
                <MenuItem key={pair} value={pair}>
                  {pair.toUpperCase()}
                </MenuItem>
              ))}
            </Select>
            {validationErrors.virtualCurrencyType && (
              <Alert severity="error">
                {validationErrors.virtualCurrencyType}
              </Alert>
            )}
          </FormControl>

          <TextField
            fullWidth
            margin="normal"
            label="下限価格"
            type="number"
            value={displaySetting.targetPrice}
            onChange={handleTargetPriceChange}
            placeholder="例: 5000000"
            error={!!validationErrors.targetPrice}
            helperText={validationErrors.targetPrice}
          />

          <TextField
            fullWidth
            margin="normal"
            label="LINEトークン"
            type="password" // ここを "password" に変更
            value={displaySetting.lineToken}
            onChange={handleLineTokenChange}
            error={!!validationErrors.lineToken}
            helperText={validationErrors.lineToken}
          />

          {(settingsError || tickerError) && (
            <Alert severity="error">システムエラーが発生しました</Alert>
          )}

          <Box display="flex" justifyContent="space-between" mt={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSettingSaveButton}
            >
              設定を保存
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() =>
                hundleLineNotificationTestButton({
                  setInfomation,
                  price: tickerData?.last,
                })
              }
            >
              LINEに通知テスト
            </Button>
          </Box>

          {infomation && (
            <Box mt={2}>
              <Alert severity="success">{infomation}</Alert>
            </Box>
          )}
        </>
      )}
    </Container>
  );
}

export default NotificationSettings;
